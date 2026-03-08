<?php
/**
 * Preuve de consentement RGPD — Enregistre chaque choix dans un fichier CSV.
 * Le fichier est stocke dans /data/consents.csv (hors webroot via .htaccess).
 *
 * Methode : POST uniquement
 * Payload attendu (JSON) :
 *   consent      — objet { functional: true, analytics: false, ... }
 *   timestamp    — date ISO du choix
 *   url          — page ou le choix a ete fait
 *   user_agent   — navigateur (optionnel)
 *   expiry_date  — date ISO d'expiration du consentement
 */

require_once __DIR__ . '/rate-limit.php';
checkRateLimit('consent', 10, 60); // 10 requêtes/min

/* --- CORS : n'accepter que le meme domaine --- */
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowed = '';

/* Charger le domaine autorise depuis .env si disponible */
$envPath = __DIR__ . '/../.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2 && trim($parts[0]) === 'SITE_ORIGIN') {
            $allowed = trim($parts[1]);
        }
    }
}

/* Si SITE_ORIGIN n'est pas configuré, construire un origin par défaut depuis HTTP_HOST */
if (!$allowed && isset($_SERVER['HTTP_HOST'])) {
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $allowed = $scheme . '://' . $_SERVER['HTTP_HOST'];
}

/* Vérifier l'origin contre le domaine autorisé */
if ($allowed && $origin) {
    if ($origin !== $allowed) {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Origin non autorise']);
        exit;
    }
    header('Access-Control-Allow-Origin: ' . $allowed);
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

/* Preflight OPTIONS */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/* POST uniquement */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Methode non autorisee']);
    exit;
}

/* --- Lire le payload JSON --- */
$raw = file_get_contents('php://input');
if (strlen($raw) > 10240) {
    http_response_code(413);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Payload too large']);
    exit;
}
$data = json_decode($raw, true);

if (!$data || !isset($data['consent']) || !isset($data['timestamp'])) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Payload invalide']);
    exit;
}

/* --- Preparer la ligne CSV --- */
$consent   = $data['consent'];
$timestamp = $data['timestamp'];
$url       = isset($data['url']) ? $data['url'] : '';
$userAgent = isset($data['user_agent']) ? $data['user_agent'] : '';
$expiry    = isset($data['expiry_date']) ? $data['expiry_date'] : '';
$ip        = $_SERVER['REMOTE_ADDR'];

/* Hash de l'IP pour anonymisation (RGPD) */
$ipHash = hash('sha256', $ip . date('Y-m'));

/* Consent en chaine lisible : "functional=1;analytics=0;marketing=0" */
$consentParts = [];
foreach ($consent as $key => $value) {
    $consentParts[] = $key . '=' . ($value ? '1' : '0');
}
$consentStr = implode(';', $consentParts);

/* --- Ecriture CSV --- */
$dataDir = __DIR__ . '/../data';

/* Creer le dossier data/ s'il n'existe pas */
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0750, true);
}

/* Securiser le dossier avec .htaccess (Apache) */
$htaccess = $dataDir . '/.htaccess';
if (!file_exists($htaccess)) {
    file_put_contents($htaccess, "Require all denied\n");
}

$csvFile = $dataDir . '/consents.csv';
$isNew   = !file_exists($csvFile);

$fp = fopen($csvFile, 'a');
if (!$fp) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Impossible d\'ecrire le fichier de consentement']);
    exit;
}

/* Verrouillage pour acces concurrent */
flock($fp, LOCK_EX);

/* Entete CSV si nouveau fichier */
if ($isNew) {
    fputcsv($fp, ['timestamp', 'ip_hash', 'consent', 'url', 'user_agent', 'expiry_date']);
}

/* Proteger contre l'injection CSV (formules Excel) */
function sanitizeCsvValue($val) {
    if (is_string($val) && isset($val[0]) && in_array($val[0], ['=', '+', '-', '@', "\t", "\r"], true)) {
        return "'" . $val;
    }
    return $val;
}

fputcsv($fp, [
    sanitizeCsvValue($timestamp),
    $ipHash,
    $consentStr,
    sanitizeCsvValue($url),
    sanitizeCsvValue($userAgent),
    sanitizeCsvValue($expiry)
]);

flock($fp, LOCK_UN);
fclose($fp);

/* --- Reponse --- */
http_response_code(200);
header('Content-Type: application/json');
echo json_encode(['ok' => true]);
