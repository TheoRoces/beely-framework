<?php
/**
 * Proxy formulaires — Masque l'URL webhook Make.com côté serveur.
 * Le client POST sur /api/form.php, le proxy forward vers Make.com.
 * L'email destinataire et l'URL webhook sont dans .env.
 */

require_once __DIR__ . '/rate-limit.php';
checkRateLimit('form', 5, 60); // 5 requêtes/min (soumission formulaire)

// Charger le .env
$envPath = __DIR__ . '/../.env';
if (!file_exists($envPath)) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Fichier .env introuvable']);
    exit;
}

$env = [];
$lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
foreach ($lines as $line) {
    $line = trim($line);
    if ($line === '' || $line[0] === '#') continue;
    $parts = explode('=', $line, 2);
    if (count($parts) === 2) {
        $env[trim($parts[0])] = trim($parts[1]);
    }
}

$webhookUrl   = isset($env['FORM_WEBHOOK_URL']) ? $env['FORM_WEBHOOK_URL'] : '';
$notifEmail   = isset($env['FORM_NOTIFICATION_EMAIL']) ? $env['FORM_NOTIFICATION_EMAIL'] : '';
$allowedOrigin = isset($env['SITE_ORIGIN']) ? $env['SITE_ORIGIN'] : '';

// CORS — ne reflète l'origin que si SITE_ORIGIN est configuré dans .env
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if ($allowedOrigin && $origin === $allowedOrigin) {
    header('Access-Control-Allow-Origin: ' . $allowedOrigin);
} elseif (!$allowedOrigin) {
    // Pas de SITE_ORIGIN configuré : on n'envoie pas de header CORS
    // Les requêtes same-origin fonctionnent sans ce header
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// POST uniquement
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit;
}

if (empty($webhookUrl)) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'FORM_WEBHOOK_URL non configuré dans .env']);
    exit;
}

// Lire le body JSON (limité à 50 Ko)
$rawBody = file_get_contents('php://input', false, null, 0, 51200);
if (strlen($rawBody) >= 51200) {
    http_response_code(413);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Payload trop volumineux (max 50 Ko)']);
    exit;
}
$data = json_decode($rawBody, true);
if (!is_array($data)) {
    $data = [];
}

// Ajouter les métadonnées serveur
if ($notifEmail) {
    $data['_notification_email'] = $notifEmail;
}
$data['_submitted_at'] = date('c');

// Forward vers Make.com
$payload = json_encode($data);
$ch = curl_init($webhookUrl);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_TIMEOUT        => 10,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Erreur de connexion au webhook']);
    exit;
}

// Succès si Make répond 200-299
header('Content-Type: application/json');
if ($httpCode >= 200 && $httpCode < 300) {
    http_response_code(200);
    echo json_encode(['success' => true]);
} else {
    http_response_code(502);
    echo json_encode(['error' => 'Le webhook a retourné une erreur', 'code' => $httpCode]);
}
