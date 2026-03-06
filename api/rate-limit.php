<?php
/**
 * Rate Limiter — Limite le nombre de requêtes par IP sur une fenêtre glissante.
 * Stockage fichier dans /data/rate-limits/ (pas de dépendance externe).
 *
 * Usage :
 *   require_once __DIR__ . '/rate-limit.php';
 *   checkRateLimit('form', 5, 60);  // 5 requêtes max par minute
 */

function checkRateLimit($endpoint, $maxRequests, $windowSeconds) {
    $ip = $_SERVER['REMOTE_ADDR'];
    $key = md5($endpoint . ':' . $ip);

    $dir = __DIR__ . '/../data/rate-limits';
    if (!is_dir($dir)) {
        mkdir($dir, 0750, true);
    }

    /* Protéger le dossier data/ (au cas où le .htaccess parent ne couvre pas) */
    $htaccess = $dir . '/.htaccess';
    if (!file_exists($htaccess)) {
        file_put_contents($htaccess, "Require all denied\n");
    }

    $file = $dir . '/' . $key . '.json';
    $now = time();

    /* Lire les timestamps existants */
    $timestamps = [];
    if (file_exists($file)) {
        $content = file_get_contents($file);
        $timestamps = json_decode($content, true);
        if (!is_array($timestamps)) {
            $timestamps = [];
        }
    }

    /* Purger les entrées hors fenêtre */
    $windowStart = $now - $windowSeconds;
    $timestamps = array_values(array_filter($timestamps, function ($ts) use ($windowStart) {
        return $ts >= $windowStart;
    }));

    /* Vérifier la limite */
    if (count($timestamps) >= $maxRequests) {
        http_response_code(429);
        header('Content-Type: application/json');
        header('Retry-After: ' . $windowSeconds);
        echo json_encode(['error' => 'Trop de requêtes. Réessayez dans quelques instants.']);
        exit;
    }

    /* Enregistrer la requête */
    $timestamps[] = $now;
    file_put_contents($file, json_encode($timestamps), LOCK_EX);

    /* Nettoyage périodique : supprimer les fichiers expirés (1 chance sur 50) */
    if (mt_rand(1, 50) === 1) {
        cleanExpiredRateLimits($dir, $windowSeconds);
    }
}

function cleanExpiredRateLimits($dir, $maxAge) {
    $now = time();
    $files = glob($dir . '/*.json');
    if (!$files) return;
    foreach ($files as $file) {
        if (filemtime($file) < ($now - $maxAge * 2)) {
            @unlink($file);
        }
    }
}
