<?php
/**
 * Proxy Baserow — Cache le token API côté serveur.
 * Le client appelle /api/baserow.php?endpoint=/api/database/rows/table/123/&size=12
 * Le proxy ajoute le header Authorization et transmet la requête à Baserow.
 */

require_once __DIR__ . '/rate-limit.php';
checkRateLimit('baserow', 30, 60); // 30 requêtes/min (pagination blog)

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

$token = isset($env['BASEROW_TOKEN']) ? $env['BASEROW_TOKEN'] : '';
$baseUrl = isset($env['BASEROW_URL']) ? $env['BASEROW_URL'] : 'https://api.baserow.io';

if (empty($token)) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'BASEROW_TOKEN non configuré dans .env']);
    exit;
}

// Preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Recuperer l'endpoint demande
$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';
if (empty($endpoint)) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Paramètre endpoint manquant']);
    exit;
}

// Valider que l'endpoint commence par /api/database/ (lecture seule Baserow)
if (strpos($endpoint, '/api/database/') !== 0) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Endpoint invalide (seul /api/database/ est autorisé)']);
    exit;
}

// Interdire les caractères de traversal dans l'endpoint
if (strpos($endpoint, '..') !== false || strpos($endpoint, '\\') !== false) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Endpoint invalide']);
    exit;
}

// Construire les query params (tout sauf "endpoint")
$params = $_GET;
unset($params['endpoint']);
$queryString = http_build_query($params);

$url = rtrim($baseUrl, '/') . $endpoint;
if (!empty($queryString)) {
    $url .= (strpos($url, '?') !== false ? '&' : '?') . $queryString;
}

// Requête vers Baserow
$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Token ' . $token,
        'Content-Type: application/json'
    ],
    CURLOPT_TIMEOUT => 15,
    CURLOPT_FOLLOWLOCATION => false
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Erreur de connexion à Baserow']);
    exit;
}

// CORS — ne reflète l'origin que si SITE_ORIGIN est configuré dans .env
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowedOrigin = isset($env['SITE_ORIGIN']) ? $env['SITE_ORIGIN'] : '';
if ($allowedOrigin && $origin === $allowedOrigin) {
    header('Access-Control-Allow-Origin: ' . $allowedOrigin);
}
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Renvoyer la reponse
http_response_code($httpCode);
header('Content-Type: application/json');
echo $response;
