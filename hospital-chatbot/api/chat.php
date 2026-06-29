<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';

function json_response(array $data): void {
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}

$raw = file_get_contents("php://input");
$body = json_decode($raw, true) ?: [];

$message = trim((string)($body['message'] ?? ''));
$lang = (($body['lang'] ?? 'ar') === 'en') ? 'en' : 'ar';

function norm(string $s): string {
  $s = trim($s);
  if ($s === '') return '';
  $s = mb_strtolower($s, 'UTF-8');
  $s = preg_replace('/\s+/u', ' ', $s);
  return trim($s);
}
function contains_any(string $text, array $needles): bool {
  foreach ($needles as $n){
    $n = norm((string)$n);
    if ($n === '') continue;
    if (mb_strpos($text, $n) !== false) return true;
  }
  return false;
}

$lower = norm($message);
if ($lower === '') {
  json_response(['reply' => ($lang==='en') ? 'Type a message.' : 'اكتب رسالتك.']);
}

try {
  $pdo = db();
} catch (Throwable $e) {
  json_response(['reply' => "DB error: ".$e->getMessage()]);
}

$greetings = array_map('norm', [
  'مرحبا','مرحباً','السلام عليكم','سلام عليكم','هلا','هلا والله','اهلا','أهلا','اهلاً','اهلن','أهلًا','اهلا وسهلا',
  'hi','hello','hey'
]);

if (contains_any($lower, $greetings)){
  json_response([
    'reply' => ($lang==='en')
      ? "Hello! I'm CuraAI. How can I help you today?"
      : "مرحبًا! معك CuraAI 🤍 كيف أقدر أخدمك اليوم؟",
    'suggestions' => ($lang==='en')
      ? ['Clinic hours', 'Visiting hours', 'Emergency location', 'Pharmacy']
      : ['مواعيد العيادات', 'مواعيد الزيارات', 'موقع الطوارئ', 'الصيدلية']
  ]);
}

try {
  // 1) FAQ quick match
  $stmt = $pdo->query("SELECT q_ar,a_ar,q_en,a_en,tags FROM faqs");
  $faqs = $stmt->fetchAll();

  foreach ($faqs as $f){
    $hay = norm(($f['q_ar'] ?? '').' '.($f['q_en'] ?? '').' '.($f['tags'] ?? ''));
    if ($hay !== '' && mb_strpos($hay, $lower) !== false) {
      $ans = ($lang==='en') ? ($f['a_en'] ?? '') : ($f['a_ar'] ?? '');
      if ($ans !== '') {
        if (contains_any($lower, ['طوارئ','emergency','موقع الطوارئ','emergency location'])){
          $em = $pdo->query("SELECT maps_url FROM emergency_info LIMIT 1")->fetch();
          if (!empty($em['maps_url'])) $ans .= "\n".$em['maps_url'];
        }
        json_response(['reply'=>$ans]);
      }
    }
  }

  // 2) Clinic hours
  if (contains_any($lower, ['مواعيد العيادات','دوام العيادات','clinic hours','hours clinic','عيادات','عيادة'])){
    $rows = $pdo->query("SELECT name_ar,name_en,days_ar,days_en,hours_ar,hours_en,area_ar,area_en,phone,maps_url FROM clinics")->fetchAll();

    foreach ($rows as $c){
      $n1 = norm($c['name_ar'] ?? '');
      $n2 = norm($c['name_en'] ?? '');
      if (($n1 && mb_strpos($lower, $n1) !== false) || ($n2 && mb_strpos($lower, norm($n2)) !== false)){
        $reply = ($lang==='en')
          ? "{$c['name_en']} Clinic\nDays: {$c['days_en']}\nHours: {$c['hours_en']}\nLocation: {$c['area_en']}"
              .(!empty($c['phone']) ? "\nPhone: {$c['phone']}" : "")
              .(!empty($c['maps_url']) ? "\nMap: {$c['maps_url']}" : "")
          : "عيادة {$c['name_ar']}\nالأيام: {$c['days_ar']}\nالوقت: {$c['hours_ar']}\nالموقع: {$c['area_ar']}"
              .(!empty($c['phone']) ? "\nرقم التواصل: {$c['phone']}" : "")
              .(!empty($c['maps_url']) ? "\nالخريطة: {$c['maps_url']}" : "");
        json_response(['reply'=>$reply]);
      }
    }

    json_response([
      'reply' => ($lang==='en')
        ? "Clinic hours: Sunday to Thursday, 8:00 AM to 4:00 PM."
        : "مواعيد العيادات: من الأحد إلى الخميس من 8 صباحًا إلى 4 مساءً.",
      'suggestions' => ($lang==='en') ? ['Visiting hours','Emergency location'] : ['مواعيد الزيارات','موقع الطوارئ']
    ]);
  }

  // 3) Visiting hours
  if (contains_any($lower, ['مواعيد الزيارات','زيارة','visiting hours','visit hours','اوقات الزيارة','اوقات الزيارات'])){
    $v = $pdo->query("SELECT info_ar, info_en FROM visiting_hours LIMIT 1")->fetch();
    $txt = ($lang==='en') ? ($v['info_en'] ?? '') : ($v['info_ar'] ?? '');
    if ($txt === '') $txt = ($lang==='en') ? "Visiting hours are not set yet." : "مواعيد الزيارات غير مضافة بعد.";
    json_response(['reply'=>$txt, 'suggestions'=> ($lang==='en') ? ['Clinic hours'] : ['مواعيد العيادات']]);
  }

  // 4) Emergency
  if (contains_any($lower, ['طوارئ','emergency'])){
    $e = $pdo->query("SELECT location_ar,location_en,phone,maps_url FROM emergency_info LIMIT 1")->fetch();
    $reply = ($lang==='en')
      ? "Emergency location: ".($e['location_en'] ?? 'North Gate')."\nNumber: ".($e['phone'] ?? '997').(!empty($e['maps_url']) ? "\nMap: ".$e['maps_url'] : "")
      : "موقع الطوارئ: ".($e['location_ar'] ?? 'البوابة الشمالية')."\nالرقم: ".($e['phone'] ?? '997').(!empty($e['maps_url']) ? "\nالخريطة: ".$e['maps_url'] : "");
    json_response(['reply'=>$reply]);
  }

  // 5) Pharmacy
  if (contains_any($lower, ['صيدلية','pharmacy'])){
    $p = $pdo->query("SELECT location_ar,location_en,hours_ar,hours_en,maps_url FROM pharmacy_info LIMIT 1")->fetch();
    $reply = ($lang==='en')
      ? "Pharmacy\nLocation: {$p['location_en']}\nHours: {$p['hours_en']}".(!empty($p['maps_url']) ? "\nMap: {$p['maps_url']}" : "")
      : "الصيدلية\nالموقع: {$p['location_ar']}\nالوقت: {$p['hours_ar']}".(!empty($p['maps_url']) ? "\nالخريطة: {$p['maps_url']}" : "");
    json_response(['reply'=>$reply]);
  }

  // 6) Services (complaints / inquiries)
  if (contains_any($lower, ['شكاوى','استفسار','استفسارات','complaints','inquiries'])){
    $s = $pdo->query("SELECT name_ar,name_en,description_ar,description_en,phone,location_ar,location_en,hours_ar,hours_en FROM services LIMIT 1")->fetch();
    $reply = ($lang==='en')
      ? "{$s['name_en']}\n{$s['description_en']}\nPhone: {$s['phone']}\nHours: {$s['hours_en']}\nLocation: {$s['location_en']}"
      : "{$s['name_ar']}\n{$s['description_ar']}\nرقم التواصل: {$s['phone']}\nساعات العمل: {$s['hours_ar']}\nالموقع: {$s['location_ar']}";
    json_response(['reply'=>$reply]);
  }

  // fallback
  json_response([
    'reply' => ($lang==='en')
      ? "Sorry, I couldn't find an answer. Try: clinic hours / visiting hours / emergency / pharmacy."
      : "عفوًا، ما لقيت إجابة. جرّب: مواعيد العيادات / مواعيد الزيارات / الطوارئ / الصيدلية.",
    'suggestions' => ($lang==='en')
      ? ['Clinic hours','Visiting hours','Emergency','Pharmacy']
      : ['مواعيد العيادات','مواعيد الزيارات','الطوارئ','الصيدلية']
  ]);

} catch (Throwable $e){
  json_response(['reply' => "Server error: ".$e->getMessage()]);
}