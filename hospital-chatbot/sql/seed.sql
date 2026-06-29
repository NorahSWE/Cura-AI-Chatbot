SET NAMES utf8mb4;

--Shared values 
SET @maps := 'https://maps.app.goo.gl/CALQcUM2G8CXX4Vj8?g_st=ic';
SET @phone := '+966 16 543 4554';

--Clinics 
DELETE FROM clinics;

INSERT INTO clinics
(name_ar, name_en, area_ar, area_en, days_ar, days_en, hours_ar, hours_en, phone, maps_url)
VALUES
('الباطنه', 'Internal Medicine',
 'داخل المستشفى الرئيسي', 'Main hospital building',
 'من الأحد إلى الخميس', 'Sunday to Thursday',
 'من 8 صباحًا إلى 4 مساءً', '8:00 AM to 4:00 PM', @phone, @maps),

('الجراحه', 'Surgery',
 'داخل المستشفى الرئيسي', 'Main hospital building',
 'من الأحد إلى الخميس', 'Sunday to Thursday',
 'من 8 صباحًا إلى 4 مساءً', '8:00 AM to 4:00 PM', @phone, @maps),

('الاسنان', 'Dentistry',
 'في العيادات الخارجية', 'Outpatient clinics',
 'من الأحد إلى الخميس', 'Sunday to Thursday',
 'من 8 صباحًا إلى 4 مساءً', '8:00 AM to 4:00 PM', @phone, @maps),

('التغذيه', 'Nutrition',
 'داخل المستشفى الرئيسي', 'Main hospital building',
 'من الأحد إلى الخميس', 'Sunday to Thursday',
 'من 8 صباحًا إلى 4 مساءً', '8:00 AM to 4:00 PM', @phone, @maps),

('المناظير', 'Endoscopy',
 'داخل المستشفى الرئيسي', 'Main hospital building',
 'من الأحد إلى الخميس', 'Sunday to Thursday',
 'من 8 صباحًا إلى 4 مساءً', '8:00 AM to 4:00 PM', @phone, @maps),

('الجلديه', 'Dermatology',
 'في العيادات الخارجية', 'Outpatient clinics',
 'من الأحد إلى الخميس', 'Sunday to Thursday',
 'من 8 صباحًا إلى 4 مساءً', '8:00 AM to 4:00 PM', @phone, @maps),

('الطب النووي', 'Nuclear Medicine',
 'داخل المستشفى الرئيسي', 'Main hospital building',
 'من الأحد إلى الخميس', 'Sunday to Thursday',
 'من 8 صباحًا إلى 4 مساءً', '8:00 AM to 4:00 PM', @phone, @maps),

('الكلى', 'Nephrology',
 'داخل المستشفى الرئيسي', 'Main hospital building',
 'من الأحد إلى الخميس', 'Sunday to Thursday',
 'من 8 صباحًا إلى 4 مساءً', '8:00 AM to 4:00 PM', @phone, @maps),

('المخ والاعصاب', 'Neurology',
 'في العيادات الخارجية', 'Outpatient clinics',
 'من الأحد إلى الخميس', 'Sunday to Thursday',
 'من 8 صباحًا إلى 4 مساءً', '8:00 AM to 4:00 PM', @phone, @maps),

('الاشعه', 'Radiology',
 'داخل المستشفى الرئيسي', 'Main hospital building',
 'من الأحد إلى الخميس', 'Sunday to Thursday',
 'من 8 صباحًا إلى 4 مساءً', '8:00 AM to 4:00 PM', @phone, @maps),

('العظام', 'Orthopedics',
 'داخل المستشفى الرئيسي', 'Main hospital building',
 'من الأحد إلى الخميس', 'Sunday to Thursday',
 'من 8 صباحًا إلى 4 مساءً', '8:00 AM to 4:00 PM', @phone, @maps),

('بنك الدم', 'Blood Bank',
 'داخل المستشفى الرئيسي', 'Main hospital building',
 'من الأحد إلى الخميس', 'Sunday to Thursday',
 'من 8 صباحًا إلى 4 مساءً', '8:00 AM to 4:00 PM', @phone, @maps),

('القلب', 'Cardiology',
 'في العيادات الخارجية', 'Outpatient clinics',
 'من الأحد إلى الخميس', 'Sunday to Thursday',
 'من 8 صباحًا إلى 4 مساءً', '8:00 AM to 4:00 PM', @phone, @maps),

('العيون', 'Ophthalmology',
 'أمام بوابة الطوارئ', 'In front of the Emergency gate',
 'من الأحد إلى الخميس', 'Sunday to Thursday',
 'من 8 صباحًا إلى 4 مساءً', '8:00 AM to 4:00 PM', @phone, @maps),

('العلاج الطبيعي', 'Physiotherapy',
 'أمام بوابة الطوارئ', 'In front of the Emergency gate',
 'من الأحد إلى الخميس', 'Sunday to Thursday',
 'من 8 صباحًا إلى 4 مساءً', '8:00 AM to 4:00 PM', @phone, @maps);

--Emergency 
DELETE FROM emergency_info;
INSERT INTO emergency_info (location_ar, location_en, phone, maps_url)
VALUES ('البوابة الشمالية', 'North Gate', '997', @maps);

--Pharmacy 
DELETE FROM pharmacy_info;
INSERT INTO pharmacy_info (location_ar, location_en, hours_ar, hours_en, phone, maps_url)
VALUES (
  'بجانب البوابة الرئيسية للمستشفى', 'Next to the main hospital gate',
  'طوال الأسبوع على مدار الساعة', '24/7 (All week)',
  NULL, @maps
);

--Visiting hours
DELETE FROM visiting_hours;
INSERT INTO visiting_hours (info_ar, info_en)
VALUES (
  'مواعيد الزيارات: يوميًا من 4 مساءً إلى 8 مساءً.',
  'Visiting hours: Daily, 4:00 PM to 8:00 PM.'
);

--Services
DELETE FROM services;
INSERT INTO services
(name_ar, name_en, description_ar, description_en, phone, location_ar, location_en, hours_ar, hours_en)
VALUES (
  'الشكاوى والاستفسارات', 'Complaints & Inquiries',
  'للشكاوى والاستفسارات تواصل مع هذا الرقم.',
  'For complaints and inquiries, please contact this number.',
  @phone,
  'مستشفى الملك خالد', 'King Khalid Hospital',
  'يوميًا من 8 صباحًا إلى 4 مساءً', 'Daily, 8:00 AM to 4:00 PM'
);

--FAQs
DELETE FROM faqs;
INSERT INTO faqs (q_ar, a_ar, q_en, a_en, tags) VALUES
('ما هي مواعيد العيادات؟', 'مواعيد العيادات: من الأحد إلى الخميس من 8 صباحًا إلى 4 مساءً.', 'What are the clinic hours?', 'Clinic hours: Sunday to Thursday, 8:00 AM to 4:00 PM.', 'clinic,hours,دوام,مواعيد,عيادات'),
('ما هي مواعيد الزيارات؟', 'مواعيد الزيارات: يوميًا من 4 مساءً إلى 8 مساءً.', 'What are the visiting hours?', 'Visiting hours: Daily, 4:00 PM to 8:00 PM.', 'visit,visiting,hours,زيارة,مواعيد'),
('أين موقع الطوارئ؟', 'الطوارئ عند البوابة الشمالية. للتوجيه افتح الخريطة من هنا: ' , 'Where is the emergency entrance?', 'Emergency is at the North Gate. Open the map here: ', 'emergency,location,طوارئ,موقع'),
('ما رقم الطوارئ؟', 'رقم الطوارئ: 997.', 'What is the emergency number?', 'Emergency number: 997.', 'emergency,number,طوارئ,رقم'),
('أين الصيدلية؟', 'الصيدلية بجانب البوابة الرئيسية للمستشفى وتعمل على مدار الساعة طوال الأسبوع.', 'Where is the pharmacy?', 'The pharmacy is next to the main hospital gate and operates 24/7.', 'pharmacy,صيدلية,مكان'),
('كيف أتواصل للشكاوى والاستفسارات؟', 'للشكاوى والاستفسارات تواصل على: +966 16 543 4554.', 'How can I contact complaints & inquiries?', 'For complaints and inquiries, call: +966 16 543 4554.', 'complaints,inquiries,شكاوى,استفسارات');