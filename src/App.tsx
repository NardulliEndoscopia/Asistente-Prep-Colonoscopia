/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Stethoscope, 
  Menu, 
  X, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  Globe, 
  MessageCircle, 
  Pause, 
  Volume2, 
  VolumeX, 
  Heart, 
  RefreshCw, 
  Calendar as CalendarIcon,
  Clock,
  ChevronRight,
  ChevronLeft,
  Info,
  Moon,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getChatResponse } from './services/geminiService';

// --- Types & Constants ---

type Language = 'es' | 'en' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'uk' | 'zh' | 'sv' | 'ar' | 'no' | 'be' | 'fi' | 'nl';

interface LangConfig {
  flag: string;
  name: string;
  voice: string;
  dir?: 'ltr' | 'rtl';
}

const LANG_CONFIG: Record<Language, LangConfig> = {
  es: { flag: "🇪🇸", name: "Español", voice: "es-ES" },
  en: { flag: "🇬🇧", name: "English", voice: "en-GB" },
  fr: { flag: "🇫🇷", name: "Français", voice: "fr-FR" },
  de: { flag: "🇩🇪", name: "Deutsch", voice: "de-DE" },
  it: { flag: "🇮🇹", name: "Italiano", voice: "it-IT" },
  pt: { flag: "🇵🇹", name: "Português", voice: "pt-PT" },
  ru: { flag: "🇷🇺", name: "Русский", voice: "ru-RU" },
  uk: { flag: "🇺🇦", name: "Українська", voice: "uk-UA" },
  zh: { flag: "🇨🇳", name: "中文", voice: "zh-CN" },
  sv: { flag: "🇸🇪", name: "Svenska", voice: "sv-SE" },
  ar: { flag: "🇸🇦", name: "العربية", voice: "ar-SA", dir: 'rtl' },
  no: { flag: "🇳🇴", name: "Norsk", voice: "nb-NO" },
  be: { flag: "🇧🇪", name: "Vlaams", voice: "nl-BE" },
  fi: { flag: "🇫🇮", name: "Suomi", voice: "fi-FI" },
  nl: { flag: "🇳🇱", name: "Nederlands", voice: "nl-NL" },
};

interface Step {
  title: string;
  description: string;
  prompt: string;
}

interface Translation {
  welcome: string;
  dateLabel: string;
  timeLabel: string;
  calcBtn: string;
  planTitle: string;
  repeatBtn: string;
  next: string;
  prev: string;
  startAssistant: string;
  doctorTitle: string;
  screens: Step[];
  narrative: string[];
}

const TRANSLATIONS: Record<Language, Translation> = {
  es: {
    welcome: "Hola. Soy su asistente virtual. Para generar su plan de preparación personalizado, por favor introduzca la fecha y la hora de su cita.",
    dateLabel: "Fecha de la cita",
    timeLabel: "Hora de la cita",
    calcBtn: "Generar Plan",
    planTitle: "Tu Preparación",
    repeatBtn: "Repetir",
    next: "Siguiente",
    prev: "Anterior",
    startAssistant: "INICIAR ASISTENTE",
    doctorTitle: "Gastroenterólogo",
    screens: [
      { title: "Medicación", description: "• Suspender Aspirina u otros inhibidores de la agregación plaquetaria como Adiro®, Iscover®, Disgren®, Tiklid®, Plavix® entre 3 y 8 días antes del examen – consulte con su médico si tiene dudas al respecto.\n• En caso de tomar Sintrom® u otro anticoagulante (Xarelto®, Pradaxa®…) debe consultar con su médico para valorar su suspensión o sustitución.\n• En caso de padecer patología cardíaca: Traiga el electrocardiograma, ecocardiograma y las indicaciones de su cardiólogo. AVISAR SI SE REQUIERE PROFILAXIS ANTIBIÓTICA.\n• Hierro oral, suspender 7 días antes de la colonoscopia.\n• NO es necesario suspender otros medicamentos – tomar hasta 12 horas antes de la prueba.", prompt: "A medical infographic showing medication instructions." },
      { title: "Tu Cronograma", description: "Inicia el [DATE1]. Siga este resumen visual.", prompt: "A medical infographic showing a timeline for colonoscopy preparation with icons for diet and hydration." },
      { title: "Días 1 y 2", description: "Días [DATE1] y [DATE2]. PERMITIDO: Carne magra, arroz, huevos. PROHIBIDOS: Frutas y verduras.", prompt: "A healthy meal plate with white rice, a boiled egg, and grilled chicken breast. No vegetables or fruits." },
      { title: "Día 3", description: "Día [DATE3]. Dieta Líquida. Recomendado caldo de pollo colado.", prompt: "A clear bowl of golden chicken broth and a glass of water on a clean table." },
      { title: "Kit Pleinvue", description: "PLEINVUE: Un sobre grande (Parte 1) y dos pequeños A y B (Parte 2).", prompt: "A professional medical box of Pleinvue laxative with sachets labeled Part 1 and Part 2." },
      { title: "Dosis 1", description: "El [DATE_D1] a las [TIME_D1]. Disolver en medio litro. Beber en dos vasos con 15 min de pausa.", prompt: "A person's hand pouring a white powder from a sachet into a glass of water." },
      { title: "Hidratación", description: "Obligatorio beber otros dos vasos (medio litro) de agua clara.", prompt: "Two clean glasses filled with sparkling clear water on a blue background." },
      { title: "Dosis 2", description: "El [DATE_D2] a las [TIME_D2]. Mezclar A+B en medio litro. Técnica Chupitos. Pausa 10-15 min.", prompt: "Two small sachets being mixed into a large glass of water." },
      { title: "STOP AGUA", description: "A partir de las [TIME_STOP] del [DATE_STOP]. NO BEBER NADA.", prompt: "A minimalist red warning sign with a water drop icon crossed out." },
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      { title: "Importante", description: "• No beba alcohol, leche, o nada de color rojo o morado (por ejemplo, zumo de frutos rojos) u otras bebidas que contengan pulpa.\n• No coma mientras toma Pleinvue® y hasta después del procedimiento clínico.\n• No podrá conducir el día de la colonoscopia ni manejar maquinaria peligrosa.\n• TRAER LOS CONSENTIMIENTOS DE COLONOSCOPIA Y SEDACIÓN FIRMADOS.\n• Acuda acompañado a la exploración con alguien que pueda conducir o auxiliarle en su regreso a casa.\n• Existe la posibilidad de que, en caso de realizar intervenciones terapéuticas, como extracción de pólipos, sea necesario que cancele sus compromisos el día siguiente, o podría necesitar quedarse en vigilancia durante 24 horas (esta situación es raramente necesaria).", prompt: "A medical infographic showing important instructions." },
      { title: "Buena Suerte", description: "El Dr. Nardulli le desea una prueba tranquila.", prompt: "A friendly doctor smiling in a professional clinic setting, giving a thumbs up." }
    ],
    narrative: [
      "Medicación. Debe suspender Aspirina u otros inhibidores de la agregación plaquetaria como Adiro, Iscover, Disgren, Tiklid o Plavix entre 3 y 8 días antes del examen. Consulte con su médico si tiene dudas. En caso de tomar Sintrom u otro anticoagulante como Xarelto o Pradaxa, debe consultar con su médico para valorar su suspensión o sustitución. En caso de padecer patología cardíaca, traiga el electrocardiograma, ecocardiograma y las indicaciones de su cardiólogo. Avise si se requiere profilaxis antibiótica. El hierro oral debe suspenderse 7 días antes de la colonoscopia. No es necesario suspender otros medicamentos, puede tomarlos hasta 12 horas antes de la prueba.",
      "Bienvenido. Su preparación comienza el [DATE1]. Aquí tiene la infografía con el resumen visual de todas las fases.",
      "Días uno y dos, el [DATE1] y [DATE2]. Dieta estricta sin fibra. Puede comer pasta, arroz, huevos, carne y pescado. Prohibido comer frutas, verduras o ensaladas.",
      "Día tres, el [DATE3]. Dieta exclusivamente líquida. Caldos colados, infusiones y agua. Se recomienda caldo de pollo. Evite líquidos rojos.",
      "El producto seleccionado por su médico para la limpieza del colon es el PLEINVUE, el cual en su caja tiene un sobre grande que será la primera parte de la preparación, y dos sobres pequeños, A y B, que serán la segunda parte de la preparación.",
      "Primera dosis el [DATE_D1] a las [TIME_D1]. Disuelva el sobre grande en medio litro de agua. Beba en dos vasos separados uno del otro por 15 minutos.",
      "Hidratación. Es obligatorio beber otros dos vasos, aproximadamente medio litro, de agua clara tras la primera dosis.",
      "Segunda dosis el [DATE_D2] a las [TIME_D2]. Mezcle los sobres A y B diluidos en medio litro de agua. Use la técnica de chupitos: sorbo pequeño, seguido de agua. Espere diez a quince minutos entre sorbos.",
      "Atención. Alto total a las [TIME_STOP] del [DATE_STOP]. Deje de beber completamente para la anestesia.",
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      "Importante. No beba alcohol, leche, o nada de color rojo o morado, como zumo de frutos rojos, u otras bebidas que contengan pulpa. No coma mientras toma Pleinvue y hasta después del procedimiento clínico. No podrá conducir el día de la colonoscopia ni manejar maquinaria peligrosa. Recuerde traer los consentimientos de colonoscopia y sedación firmados. Acuda acompañado a la exploración con alguien que pueda conducir o auxiliarle en su regreso a casa. Existe la posibilidad de que, en caso de realizar intervenciones terapéuticas como extracción de pólipos, sea necesario que cancele sus compromisos el día siguiente, o podría necesitar quedarse en vigilancia durante 24 horas, aunque esta situación es raramente necesaria.",
      "Hemos terminado. El Dr. Nardulli y su equipo le desean una buena experiencia. ¡Mucho ánimo!"
    ]
  },
  en: {
    welcome: "Hello. I am your virtual assistant. To generate your personalized plan, please enter your appointment date and time.",
    dateLabel: "Appointment Date",
    timeLabel: "Appointment Time",
    calcBtn: "Generate Plan",
    planTitle: "Your Preparation",
    repeatBtn: "Repeat",
    next: "Next",
    prev: "Previous",
    startAssistant: "START ASSISTANT",
    doctorTitle: "Gastroenterologist",
    screens: [
      { title: "Medication", description: "• Suspend Aspirin or other platelet aggregation inhibitors like Adiro®, Iscover®, Disgren®, Tiklid®, Plavix® 3 to 8 days before the exam – consult your doctor if in doubt.\n• If taking Sintrom® or another anticoagulant (Xarelto®, Pradaxa®...), consult your doctor to assess its suspension or substitution.\n• If you have heart disease: Bring your electrocardiogram, echocardiogram, and your cardiologist's instructions. NOTIFY IF ANTIBIOTIC PROPHYLAX IS REQUIRED.\n• Oral iron, suspend 7 days before the colonoscopy.\n• It is NOT necessary to suspend other medications – take up to 12 hours before the test.", prompt: "A medical infographic showing medication instructions." },
      { title: "Your Timeline", description: "Starts on [DATE1]. Follow this visual summary.", prompt: "A medical infographic showing a timeline for colonoscopy preparation with icons for diet and hydration." },
      { title: "Days 1 & 2", description: "Days [DATE1] and [DATE2]. ALLOWED: Lean meat, rice, eggs. FORBIDDEN: Fruits and vegetables.", prompt: "A healthy meal plate with white rice, a boiled egg, and grilled chicken breast. No vegetables or fruits." },
      { title: "Day 3", description: "Day [DATE3]. Liquid diet only. Strained chicken broth is recommended.", prompt: "A clear bowl of golden chicken broth and a glass of water on a clean table." },
      { title: "Pleinvue Kit", description: "PLEINVUE: One large sachet (Part 1) and two small sachets A and B (Part 2).", prompt: "A professional medical box of Pleinvue laxative with sachets labeled Part 1 and Part 2." },
      { title: "Dose 1", description: "On [DATE_D1] at [TIME_D1]. Dissolve in half a liter. Drink in two glasses with a 15 min pause.", prompt: "A person's hand pouring a white powder from a sachet into a glass of water." },
      { title: "Extra Hydration", description: "Mandatory to drink two more glasses (half a liter) of clear water.", prompt: "Two clean glasses filled with sparkling clear water on a blue background." },
      { title: "Dose 2", description: "On [DATE_D2] at [TIME_D2]. Mix A+B in half a liter. Sip technique. 10-15 min pause.", prompt: "Two small sachets being mixed into a large glass of water." },
      { title: "STOP WATER", description: "From [TIME_STOP] on [DATE_STOP]. DO NOT DRINK ANYTHING.", prompt: "A minimalist red warning sign with a water drop icon crossed out." },
      { title: "Important", description: "• Do not drink alcohol, milk, or anything red or purple (e.g., berry juice) or other drinks containing pulp.\n• Do not eat while taking Pleinvue® and until after the clinical procedure.\n• You will not be able to drive on the day of the colonoscopy or operate dangerous machinery.\n• BRING THE SIGNED COLONOSCOPY AND SEDATION CONSENTS.\n• Come accompanied to the examination by someone who can drive or assist you on your return home.\n• There is a possibility that, in case of therapeutic interventions, such as polyp removal, you may need to cancel your commitments the next day, or you might need to stay under observation for 24 hours (this situation is rarely necessary).", prompt: "A medical infographic showing important instructions." },
      { title: "Good Luck", description: "Dr. Nardulli wishes you a smooth procedure.", prompt: "A friendly doctor smiling in a professional clinic setting, giving a thumbs up." }
    ],
    narrative: [
      "Medication. You must suspend Aspirin or other platelet aggregation inhibitors like Adiro, Iscover, Disgren, Tiklid, or Plavix between 3 and 8 days before the exam. Consult your doctor if you have doubts. If you take Sintrom or another anticoagulant like Xarelto or Pradaxa, you must consult your doctor to assess its suspension or substitution. If you have heart disease, bring your electrocardiogram, echocardiogram, and your cardiologist's instructions. Notify if antibiotic prophylaxis is required. Oral iron must be suspended 7 days before the colonoscopy. It is not necessary to suspend other medications, you can take them up to 12 hours before the test.",
      "Welcome. Your preparation begins on [DATE1]. Here is the infographic with the visual summary of all phases.",
      "Days one and two, on [DATE1] and [DATE2]. Strict diet without fiber. You may eat pasta, rice, eggs, meat, and fish. It is forbidden to eat fruits, vegetables, or salads.",
      "Day three, on [DATE3]. Exclusively liquid diet. Strained broths, infusions, and water. Chicken broth is recommended. Avoid red liquids.",
      "The product selected by your doctor for colon cleansing is PLEINVUE. Its box contains a large sachet, which will be the first part of the preparation, and two small sachets, A and B, which will be the second part.",
      "First dose on [DATE_D1] at [TIME_D1]. Dissolve the large sachet in half a liter of water. Drink in two glasses separated by 15 minutes.",
      "Hydration. It is mandatory to drink two more glasses, approximately half a liter, of clear water after the first dose.",
      "Second dose on [DATE_D2] at [TIME_D2]. Mix sachets A and B diluted in half a liter of water. Use the sip technique: small sip, followed by water. Wait ten to fifteen minutes between sips.",
      "Attention. Total stop at [TIME_STOP] on [DATE_STOP]. Stop drinking completely for the anesthesia.",
      "Important. Do not drink alcohol, milk, or anything red or purple, such as berry juice, or other drinks containing pulp. Do not eat while taking Pleinvue and until after the clinical procedure. You will not be able to drive on the day of the colonoscopy or operate dangerous machinery. Remember to bring the signed colonoscopy and sedation consents. Come accompanied to the examination by someone who can drive or assist you on your return home. There is a possibility that, in case of therapeutic interventions such as polyp removal, you may need to cancel your commitments the next day, or you might need to stay under observation for 24 hours, although this situation is rarely necessary.",
      "We are done. Dr. Nardulli and his team wish you a good experience. Best of luck!"
    ]
  },
  fr: {
    welcome: "Bonjour. Je suis votre assistant virtuel. Veuillez entrer la date et l'heure de votre rendez-vous pour générer votre plan.",
    dateLabel: "Date du rendez-vous",
    timeLabel: "Heure du rendez-vous",
    calcBtn: "Générer le Plan",
    planTitle: "Votre Préparation",
    repeatBtn: "Répéter",
    next: "Suivant",
    prev: "Précédent",
    startAssistant: "LANCER L'ASSISTANT",
    doctorTitle: "Gastro-entérologue",
    screens: [
      { title: "Médicaments", description: "• Suspendre l'Aspirine ou autres inhibiteurs de l'agrégation plaquettaire comme Adiro®, Iscover®, Disgren®, Tiklid®, Plavix® 3 à 8 jours avant l'examen – consultez votre médecin en cas de doute.\n• Si vous prenez du Sintrom® ou un autre anticoagulant (Xarelto®, Pradaxa®...), consultez votre médecin pour évaluer sa suspension ou son remplacement.\n• En cas de maladie cardiaque : Apportez votre électrocardiogramme, échocardiogramme et les instructions de votre cardiologue. PRÉVENIR SI UNE PROPHYLAXIE ANTIBIOTIQUE EST REQUISE.\n• Fer oral, suspendre 7 jours avant la coloscopie.\n• Il n'est PAS nécessaire de suspendre d'autres médicaments – prendre jusqu'à 12 heures avant le test.", prompt: "A medical infographic showing medication instructions." },
      { title: "Chronologie", description: "Débute le [DATE1]. Suivez ce résumé visuel.", prompt: "Une infographie médicale montrant une chronologie pour la préparation à la coloscopie." },
      { title: "Jours 1 et 2", description: "Jours [DATE1] et [DATE2]. AUTORISÉ : Viande, riz, œufs. INTERDIT : Fruits et légumes.", prompt: "Une assiette de repas sain avec du riz blanc, un œuf dur et du blanc de poulet grillé." },
      { title: "Jour 3", description: "Jour [DATE3]. Diète liquide. Bouillon de poulet filtré recommandé.", prompt: "Un bol transparent de bouillon de poulet doré et un verre d'eau." },
      { title: "Kit Pleinvue", description: "PLEINVUE : Un grand sachet (Partie 1) et deux petits A et B (Partie 2).", prompt: "Une boîte médicale professionnelle de laxatif Pleinvue." },
      { title: "Dose 1", description: "Le [DATE_D1] à [TIME_D1]. Dissoudre dans un demi-litre. Deux verres (15 min de pause).", prompt: "Une main versant une poudre blanche d'un sachet dans un verre d'eau." },
      { title: "Hydratation", description: "Obligatoire : boire deux autres verres (un demi-litre) d'eau claire.", prompt: "Deux verres propres remplis d'eau claire pétillante." },
      { title: "Dose 2", description: "Le [DATE_D2] à [TIME_D2]. Mélanger A+B dans un demi-litre. Technique des gorgées.", prompt: "Deux petits sachets mélangés dans un grand verre d'eau." },
      { title: "ARRÊT EAU", description: "À partir de [TIME_STOP] le [DATE_STOP]. NE RIEN BOIRE.", prompt: "Un panneau d'avertissement rouge minimaliste avec une icône de goutte d'eau barrée." },
      { title: "Important", description: "• Ne buvez pas d'alcool, de lait, ou quoi que ce soit de rouge ou violet (par exemple, jus de fruits rouges) ou d'autres boissons contenant de la pulpe.\n• Ne mangez pas pendant la prise de Pleinvue® et jusqu'après la procédure clinique.\n• Vous ne pourrez pas conduire le jour de la coloscopie ni utiliser de machines dangereuses.\n• APPORTER LES CONSENTEMENTS DE COLOSCOPIE ET DE SÉDATION SIGNÉS.\n• Venez accompagné à l'examen par quelqu'un qui peut conduire ou vous aider à rentrer chez vous.\n• Il est possible que, en cas d'interventions thérapeutiques, comme l'ablation de polypes, vous deviez annuler vos engagements le lendemain, ou vous pourriez avoir besoin de rester en observation pendant 24 heures (cette situation est rarement nécessaire).", prompt: "A medical infographic showing important instructions." },
      { title: "Bonne Chance", description: "Le Dr Nardulli vous souhaite un examen serein.", prompt: "Un médecin amical souriant dans une clinique professionnelle." }
    ],
    narrative: [
      "Médicaments. Vous devez suspendre l'Aspirine ou autres inhibiteurs de l'agrégation plaquettaire comme Adiro, Iscover, Disgren, Tiklid ou Plavix entre 3 et 8 jours avant l'examen. Consultez votre médecin en cas de doute. Si vous prenez du Sintrom ou un autre anticoagulant comme Xarelto ou Pradaxa, vous devez consulter votre médecin pour évaluer sa suspension ou son remplacement. En cas de maladie cardiaque, apportez votre électrocardiogramme, échocardiogramme et les instructions de votre cardiologue. Prévenez si une prophylaxie antibiotique est requise. Le fer oral doit être suspendu 7 jours avant la coloscopie. Il n'est pas nécessaire de suspendre d'autres médicaments, vous pouvez les prendre jusqu'à 12 heures avant le test.",
      "Bienvenue. Votre préparation commence le [DATE1]. Voici l'infographie avec le résumé visuel de toutes les phases.",
      "Jours un et deux, le [DATE1] et [DATE2]. Régime strict sans fibres. Vous pouvez manger des pâtes, du riz, des œufs, de la viande et du poisson.",
      "Jour trois, le [DATE3]. Régime exclusivement liquide. Bouillons filtrés, infusions et eau.",
      "Le produit sélectionné par votre médecin est le PLEINVUE.",
      "Première dose le [DATE_D1] à [TIME_D1]. Dissolvez le grand sachet dans un demi-litre d'eau.",
      "Hydratation. Il est obligatoire de boire deux autres verres d'eau claire.",
      "Deuxième dose le [DATE_D2] à [TIME_D2]. Mélangez les sachets A et B.",
      "Attention. Arrêt total à [TIME_STOP] le [DATE_STOP].",
      "Important. Ne buvez pas d'alcool, de lait, ou quoi que ce soit de rouge ou violet, comme du jus de fruits rouges, ou d'autres boissons contenant de la pulpe. Ne mangez pas pendant la prise de Pleinvue et jusqu'après la procédure clinique. Vous ne pourrez pas conduire le jour de la coloscopie ni utiliser de machines dangereuses. N'oubliez pas d'apporter les consentements de coloscopie et de sédation signés. Venez accompagné à l'examen par quelqu'un qui peut conduire ou vous aider à rentrer chez vous. Il est possible que, en cas d'interventions thérapeutiques comme l'ablation de polypes, vous deviez annuler vos engagements le lendemain, ou vous pourriez avoir besoin de rester en observation pendant 24 heures, bien que cette situation soit rarement nécessaire.",
      "Nous avons terminé. Bonne chance !"
    ]
  },
  de: {
    welcome: "Hallo. Ich bin Ihr virtueller Assistent. Geben Sie bitte Datum und Uhrzeit Ihres Termins ein.",
    dateLabel: "Termindatum",
    timeLabel: "Terminuhrzeit",
    calcBtn: "Plan Erstellen",
    planTitle: "Ihre Vorbereitung",
    repeatBtn: "Wiederholen",
    next: "Weiter",
    prev: "Zurück",
    startAssistant: "ASSISTENT STARTEN",
    doctorTitle: "Gastroenterologe",
    screens: [
      { title: "Medikamente", description: "• Setzen Sie Aspirin oder andere Thrombozytenaggregationshemmer wie Adiro®, Iscover®, Disgren®, Tiklid®, Plavix® 3 bis 8 Tage vor der Untersuchung ab – konsultieren Sie im Zweifelsfall Ihren Arzt.\n• Wenn Sie Sintrom® oder ein anderes Antikoagulans (Xarelto®, Pradaxa®...) einnehmen, konsultieren Sie Ihren Arzt, um das Absetzen oder Ersetzen zu beurteilen.\n• Bei Herzerkrankungen: Bringen Sie Ihr Elektrokardiogramm, Echokardiogramm und die Anweisungen Ihres Kardiologen mit. MELDEN SIE, WENN EINE ANTIBIOTIKAPROPHYLAXE ERFORDERLICH IST.\n• Orales Eisen 7 Tage vor der Koloskopie absetzen.\n• Es ist NICHT notwendig, andere Medikamente abzusetzen – bis zu 12 Stunden vor dem Test einnehmen.", prompt: "A medical infographic showing medication instructions." },
      { title: "Zeitplan", description: "Beginnt am [DATE1]. Folgen Sie dieser Übersicht.", prompt: "Eine medizinische Infografik, die einen Zeitplan für die Darmspiegelungsvorbereitung zeigt." },
      { title: "Tage 1 & 2", description: "Tage [DATE1] und [DATE2]. ERLAUBT: Fleisch, Reis, Eier. VERBOTEN: Obst und Gemüse.", prompt: "Ein gesunder Teller mit weißem Reis, einem gekochten Ei und gegrillter Hähnchenbrust." },
      { title: "Tag 3", description: "Tag [DATE3]. Nur flüssige Diät. Durchgesiebte Hühnerbrühe empfohlen.", prompt: "Eine klare Schüssel mit goldener Hühnerbrühe und ein Glas Wasser." },
      { title: "Pleinvue Kit", description: "PLEINVUE: Ein großer Beutel (Teil 1) und zwei kleine A und B (Teil 2).", prompt: "Eine professionelle medizinische Schachtel mit Pleinvue-Abführmittel." },
      { title: "Dosis 1", description: "Am [DATE_D1] um [TIME_D1]. In einem halben Liter auflösen. Zwei Gläser (15 Min Pause).", prompt: "Eine Hand, die weißes Pulver aus einem Beutel in ein Glas Wasser schüttet." },
      { title: "Wasser", description: "Obligatorisch: zwei weitere Gläser (einen halben Liter) klares Wasser trinken.", prompt: "Zwei saubere Gläser, gefüllt mit klarem Wasser." },
      { title: "Dosis 2", description: "Am [DATE_D2] um [TIME_D2]. A+B in einem halben Liter mischen. Schlucktechnik.", prompt: "Zwei kleine Beutel, die in ein großes Glas Wasser gemischt werden." },
      { title: "STOPP", description: "Ab [TIME_STOP] am [DATE_STOP]. NICHTS MEHR TRINKEN.", prompt: "Ein minimalistisches rotes Warnschild mit einem durchgestrichenen Wassertropfen-Symbol." },
      { title: "Wichtig", description: "• Trinken Sie keinen Alkohol, keine Milch oder irgendetwas Rotes oder Lila (z. B. Beerensaft) oder andere Getränke mit Fruchtfleisch.\n• Essen Sie nicht während der Einnahme von Pleinvue® und bis nach dem klinischen Eingriff.\n• Sie dürfen am Tag der Koloskopie nicht Auto fahren oder gefährliche Maschinen bedienen.\n• BRINGEN SIE DIE UNTERSCHRIEBENEN EINWILLIGUNGEN FÜR KOLOSKOPIE UND SEDIERUNG MIT.\n• Kommen Sie in Begleitung zur Untersuchung mit jemandem, der fahren oder Ihnen bei der Heimkehr helfen kann.\n• Es besteht die Möglichkeit, dass Sie im Falle von therapeutischen Eingriffen, wie z. B. Polypenentfernung, Ihre Verpflichtungen am nächsten Tag absagen müssen, oder Sie müssen möglicherweise 24 Stunden zur Beobachtung bleiben (diese situation ist selten erforderlich).", prompt: "A medical infographic showing important instructions." },
      { title: "Viel Glück", description: "Dr. Nardulli wünscht Ihnen eine reibungslose Untersuchung.", prompt: "Ein freundlicher Arzt, der in einer professionellen Klinik lächelt." }
    ],
    narrative: [
      "Medikamente. Sie müssen Aspirin oder andere Thrombozytenaggregationshemmer wie Adiro, Iscover, Disgren, Tiklid oder Plavix zwischen 3 und 8 Tagen vor der Untersuchung absetzen. Konsultieren Sie im Zweifelsfall Ihren Arzt. Wenn Sie Sintrom oder ein anderes Antikoagulans wie Xarelto oder Pradaxa einnehmen, müssen Sie Ihren Arzt konsultieren, um das Absetzen oder Ersetzen zu beurteilen. Bei Herzerkrankungen bringen Sie Ihr Elektrokardiogramm, Echokardiogramm und die Anweisungen Ihres Kardiologen mit. Melden Sie, wenn eine Antibiotikaprophylaxe erforderlich ist. Orales Eisen muss 7 Tage vor der Koloskopie abgesetzt werden. Es ist nicht notwendig, andere Medikamente abzusetzen, Sie können diese bis zu 12 Stunden vor dem Test einnehmen.",
      "Willkommen. Ihre Vorbereitung beginnt am [DATE1].",
      "Tag eins und zwei, am [DATE1] und [DATE2]. Strenge Diät ohne Ballaststoffe.",
      "Tag drei, am [DATE3]. Ausschließlich flüssige Diät.",
      "Das Produkt ist PLEINVUE.",
      "Erste Dosis am [DATE_D1] um [TIME_D1].",
      "Flüssigkeitszufuhr. Es ist obligatorisch, zwei weitere Gläser Wasser zu trinken.",
      "Zweite Dosis am [DATE_D2] um [TIME_D2].",
      "Achtung. Totaler Stopp um [TIME_STOP] am [DATE_STOP].",
      "Wichtig. Trinken Sie keinen Alkohol, keine Milch oder irgendetwas Rotes oder Lila, wie z. B. Beerensaft, oder andere Getränke mit Fruchtfleisch. Essen Sie nicht während der Einnahme von Pleinvue und bis nach dem klinischen Eingriff. Sie dürfen am Tag der Koloskopie nicht Auto fahren oder gefährliche Maschinen bedienen. Denken Sie daran, die unterschriebenen Einwilligungen für Koloskopie und Sedierung mitzubringen. Kommen Sie in Begleitung zur Untersuchung mit jemandem, der fahren oder Ihnen bei der Heimkehr helfen kann. Es besteht die Möglichkeit, dass Sie im Falle von therapeutischen Eingriffen wie z. B. Polypenentfernung Ihre Verpflichtungen am nächsten Tag absagen müssen, oder Sie müssen möglicherweise 24 Stunden zur Beobachtung bleiben, obwohl diese Situation selten erforderlich ist.",
      "Wir sind fertig. Viel Glück!"
    ]
  },
  it: {
    welcome: "Buongiorno. Sono il suo assistente virtuale. Inserisca la data e l'ora del suo appuntamento.",
    dateLabel: "Data appuntamento",
    timeLabel: "Ora appuntamento",
    calcBtn: "Genera Piano",
    planTitle: "Preparazione",
    repeatBtn: "Ripeti",
    next: "Avanti",
    prev: "Indietro",
    startAssistant: "AVVIA ASSISTENTE",
    doctorTitle: "Gastroenterologo",
    screens: [
      { title: "Farmaci", description: "• Sospendere Aspirina o altri inibitori dell'aggregazione piastrinica come Adiro®, Iscover®, Disgren®, Tiklid®, Plavix® tra 3 e 8 giorni prima dell'esame – consulti il medico in caso di dubbi.\n• In caso di assunzione di Sintrom® o altro anticoagulante (Xarelto®, Pradaxa®…), consultare il medico per valutarne la sospensione o sostituzione.\n• In caso di patologia cardiaca: Portare l'elettrocardiogramma, l'ecocardiogramma e le indicazioni del cardiologo. AVVISARE SE È RICHIESTA PROFILASSI ANTIBIOTICA.\n• Ferro orale, sospendere 7 giorni prima della colonscopia.\n• NON è necessario sospendere altri farmaci – assumere fino a 12 ore prima del test.", prompt: "A medical infographic showing medication instructions." },
      { title: "Cronologia", description: "Inizia il [DATE1]. Segua questo riassunto visivo.", prompt: "Un'infografica medica che mostra una cronologia per la preparazione alla colonscopia." },
      { title: "Giorni 1 e 2", description: "Giorni [DATE1] e [DATE2]. PERMESSO: Carne, riso, uova. PROIBITO: Frutta e verdura.", prompt: "Un piatto sano con riso bianco, un uovo sodo e petto di pollo alla griglia." },
      { title: "Giorno 3", description: "Giorno [DATE3]. Dieta liquida. Consigliato brodo di pollo filtrato.", prompt: "Una ciotola trasparente di brodo di pollo dorato e un bicchiere d'acqua." },
      { title: "Kit Pleinvue", description: "PLEINVUE: Una busta grande (Parte 1) e due piccole A e B (Parte 2).", prompt: "Una scatola medica professionale di lassativo Pleinvue." },
      { title: "Dose 1", description: "Il [DATE_D1] alle [TIME_D1]. Sciogliere in mezzo litro. Due bicchieri (pausa 15 min).", prompt: "Una mano che versa una polvere bianca da una bustina in un bicchiere d'acqua." },
      { title: "Idratazione", description: "Obbligatorio bere altri due bicchieri (mezzo litro) di acqua limpida.", prompt: "Due bicchieri puliti pieni di acqua limpida." },
      { title: "Dose 2", description: "Il [DATE_D2] alle [TIME_D2]. Mescolare A+B in mezzo litro. Tecnica a piccoli sorsi.", prompt: "Due piccole bustine mescolate in un grande bicchiere d'acqua." },
      { title: "STOP ACQUA", description: "Dalle [TIME_STOP] del [DATE_STOP]. NON BERE NULLA.", prompt: "Un segnale di avvertimento rosso minimalista con un'icona a goccia d'acqua barrata." },
      { title: "Importante", description: "• Non beva alcol, latte, o nulla di colore rosso o viola (ad esempio, succo di frutti rossi) o altre bevande contenenti polpa.\n• Non mangi mentre assume Pleinvue® e fino a dopo la procedura clinica.\n• Non potrà guidare il giorno della colonscopia né manovrare macchinari pericolosi.\n• PORTARE I CONSENSI DI COLONSCOPIA E SEDAZIONE FIRMATI.\n• Si rechi all'esame accompagnato da qualcuno che possa guidare o assisterla nel ritorno a casa.\n• Esiste la possibilità che, in caso di interventi terapeutici, come l'asportazione di polipi, sia necessario annullare i propri impegni il giorno successivo, o potrebbe essere necessario rimanere in osservazione per 24 ore (questa situazione è raramente necessaria).", prompt: "A medical infographic showing important instructions." },
      { title: "Buona Fortuna", description: "Il Dr. Nardulli le augura un esame sereno.", prompt: "Un medico amichevole che sorride in una clinica professionale." }
    ],
    narrative: [
      "Farmaci. Deve sospendere Aspirina o altri inibitori dell'aggregazione piastrinica come Adiro, Iscover, Disgren, Tiklid o Plavix tra 3 e 8 giorni prima dell'esame. Consulti il medico in caso di dubbi. In caso di assunzione di Sintrom o altro anticoagulante come Xarelto o Pradaxa, deve consultare il medico per valutarne la sospensione o sostituzione. In caso di patologia cardiaca, portare l'elettrocardiogramma, l'ecocardiogramma e le indicazioni del cardiologo. Avvisare se è richiesta profilassi antibiotica. Il ferro orale deve essere sospeso 7 giorni prima della colonscopia. Non è necessario sospendere altri farmaci, può assumerli fino a 12 ore prima del test.",
      "Benvenuto. La sua preparazione inizia il [DATE1].",
      "Giorni uno e due, il [DATE1] e [DATE2]. Dieta rigorosa senza fibre.",
      "Giorno tre, il [DATE3]. Dieta esclusivamente liquida.",
      "Il prodotto è PLEINVUE.",
      "Prima dose il [DATE_D1] alle [TIME_D1].",
      "Idratazione. È obbligatorio bere altri due bicchieri d'acqua.",
      "Seconda dose il [DATE_D2] alle [TIME_D2].",
      "Attenzione. Stop totale alle [TIME_STOP] del [DATE_STOP].",
      "Importante. Non beva alcol, latte, o nulla di colore rosso o viola, come succo di frutti rossi, o altre bevande contenenti polpa. Non mangi mentre assume Pleinvue e fino a dopo la procedura clinica. Non potrà guidare il giorno della colonscopia né manovrare macchinari pericolosi. Ricordi di portare i consensi di colonscopia e sedazione firmati. Si rechi all'esame accompagnato da qualcuno che possa guidare o assisterla nel ritorno a casa. Esiste la possibilità che, in caso di interventi terapeutici come l'asportazione di polipi, sia necessario annullare i propri impegni il giorno successivo, o potrebbe essere necessario rimanere in osservazione per 24 ore, sebbene questa situazione sia raramente necessaria.",
      "Abbiamo finito. Buona fortuna!"
    ]
  },
  pt: {
    welcome: "Olá. Sou o seu assistente virtual. Insira a data e a hora da sua consulta para gerar o plano.",
    dateLabel: "Data da consulta",
    timeLabel: "Hora da consulta",
    calcBtn: "Gerar Plano",
    planTitle: "Sua Preparação",
    repeatBtn: "Repetir",
    next: "Próximo",
    prev: "Anterior",
    startAssistant: "INICIAR ASSISTENTE",
    doctorTitle: "Gastroenterologista",
    screens: [
      { title: "Medicação", description: "• Suspender Aspirina ou outros inibidores da agregação plaquetária como Adiro®, Iscover®, Disgren®, Tiklid®, Plavix® entre 3 e 8 dias antes do exame – consulte o seu médico se tiver dúvidas.\n• No caso de tomar Sintrom® ou outro anticoagulante (Xarelto®, Pradaxa®…), deve consultar o seu médico para avaliar a sua suspensão ou substituição.\n• Em caso de patologia cardíaca: Traga o eletrocardiograma, ecocardiograma e as indicações do seu cardiologista. AVISAR SE FOR NECESSÁRIA PROFILAXIA ANTIBIÓTICA.\n• Ferro oral, suspender 7 dias antes da colonoscopia.\n• NÃO é necessário suspender outros medicamentos – tomar até 12 horas antes do teste.", prompt: "A medical infographic showing medication instructions." },
      { title: "Cronograma", description: "Inicia em [DATE1]. Siga este resumo visual.", prompt: "Um infográfico médico mostrando um cronograma para a preparação da colonoscopia." },
      { title: "Dias 1 e 2", description: "Dias [DATE1] e [DATE2]. PERMITIDO: Carne, arroz, ovos. PROIBIDO: Frutas e vegetais.", prompt: "Um prato de refeição saudável com arroz branco, um ovo cozido e peito de frango grelhado." },
      { title: "Dia 3", description: "Dia [DATE3]. Apenas líquidos claros. Recomendado caldo de galinha coado.", prompt: "Uma tigela transparente de caldo de galinha dourado e um copo de água." },
      { title: "Kit Pleinvue", description: "PLEINVUE: Uma saqueta grande (Parte 1) e duas pequenas A e B (Parte 2).", prompt: "Uma caixa médica profissional de laxante Pleinvue." },
      { title: "Dose 1", description: "Dia [DATE_D1] às [TIME_D1]. Dissolver em meio litro. Dois copos (pausa de 15 min).", prompt: "Uma mão despejando um pó branco de uma saqueta em um copo de água." },
      { title: "Hidratação", description: "Obrigatório beber mais dois copos (meio litro) de água limpa.", prompt: "Dois copos limpos cheios de água límpida." },
      { title: "Dose 2", description: "Dia [DATE_D2] às [TIME_D2]. Misturar A+B em meio litro. Técnica de pequenos goles.", prompt: "Duas pequenas saquetas misturadas em um grande copo de água." },
      { title: "PARAR ÁGUA", description: "A partir das [TIME_STOP] de [DATE_STOP]. NÃO BEBA NADA.", prompt: "Um sinal de aviso vermelho minimalista com um ícone de gota de água riscado." },
      { title: "Importante", description: "• Não beba álcool, leite, ou nada de cor vermelha ou roxa (por exemplo, sumo de frutos vermelhos) ou outras bebidas que contenham polpa.\n• Não coma enquanto toma Pleinvue® e até depois do procedimento clínico.\n• Não poderá conduzir no dia da colonoscopia nem manusear máquinas perigosas.\n• TRAZER OS CONSENTIMENTOS DE COLONOSCOPIA E SEDAÇÃO ASSINADOS.\n• Dirija-se ao exame acompanhado por alguém que possa conduzir ou auxiliá-lo no regresso a casa.\n• Existe a possibilidade de que, em caso de intervenções terapêuticas, como extração de pólipos, seja necessário cancelar os seus compromissos no dia seguinte, ou poderá precisar de ficar em vigilância durante 24 horas (esta situação é raramente necessária).", prompt: "A medical infographic showing important instructions." },
      { title: "Boa Sorte", description: "O Dr. Nardulli deseja-lhe um exame tranquilo.", prompt: "Um médico amigável sorrindo em uma clínica profissional." }
    ],
    narrative: [
      "Medicação. Deve suspender Aspirina ou outros inibidores da agregação plaquetária como Adiro, Iscover, Disgren, Tiklid ou Plavix entre 3 e 8 dias antes do exame. Consulte o seu médico se tiver dúvidas. No caso de tomar Sintrom ou outro anticoagulante como Xarelto ou Pradaxa, deve consultar o seu médico para avaliar a sua suspensão ou substituição. Em caso de patologia cardíaca, traga o eletrocardiograma, ecocardiograma e as indicações do seu cardiologista. Avise se for necessária profilaxia antibiótica. O ferro oral deve ser suspenso 7 dias antes da colonoscopia. Não é necessário suspender outros medicamentos, pode tomá-los até 12 horas antes do teste.",
      "Bem-vindo. A sua preparação começa no dia [DATE1].",
      "Dias um e dois, em [DATE1] e [DATE2]. Dieta rigorosa sem fibras.",
      "Dia tres, em [DATE3]. Dieta exclusivamente líquida.",
      "O produto é o PLEINVUE.",
      "Primeira dose no dia [DATE_D1] às [TIME_D1].",
      "Hidratação. É obrigatório beber mais dois copos de água.",
      "Segunda dose no dia [DATE_D2] às [TIME_D2].",
      "Atenção. Paragem total às [TIME_STOP] de [DATE_STOP].",
      "Importante. Não beba álcool, leite, ou nada de cor vermelha ou roxa, como sumo de frutos vermelhos, ou outras bebidas que contenham polpa. Não coma enquanto toma Pleinvue e até depois do procedimento clínico. Não poderá conduzir no dia da colonoscopia nem manusear máquinas perigosas. Lembre-se de trazer os consentimentos de colonoscopia e sedação assinados. Dirija-se ao exame acompanhado por alguém que possa conduzir ou auxiliá-lo no regresso a casa. Existe a possibilidade de que, em caso de intervenções terapêuticas como extração de pólipos, seja necessário cancelar os seus compromissos no dia seguinte, ou poderá precisar de ficar em vigilância durante 24 horas, embora esta situação seja raramente necessária.",
      "Terminámos. Boa sorte!"
    ]
  },
  ru: {
    welcome: "Здравствуйте. Я ваш виртуальный помощник. Чтобы составить ваш персональный план подготовки, пожалуйста, введите дату и время приема.",
    dateLabel: "Дата приема",
    timeLabel: "Время приема",
    calcBtn: "Составить план",
    planTitle: "Ваша подготовка",
    repeatBtn: "Повторить",
    next: "Далее",
    prev: "Назад",
    startAssistant: "ЗАПУСТИТЬ ПОМОЩНИКА",
    doctorTitle: "Гастроэнтеролог",
    screens: [
      { title: "Медикаменты", description: "• Приостановить прием Аспирина или других ингибиторов агрегации тромбоцитов, таких как Adiro®, Iscover®, Disgren®, Tiklid®, Plavix®, за 3-8 дней до исследования – проконсультируйтесь с врачом при сомнениях.\n• В случае приема Sintrom® или другого антикоагулянта (Xarelto®, Pradaxa®...), проконсультируйтесь с врачом для оценки его отмены или замены.\n• При сердечной патологии: Принесите электрокардиограмму, эхокардиограмму и указания вашего кардиолога. СООБЩИТЕ, ЕСЛИ ТРЕБУЕТСЯ АНТИБИОТИКОПРОФИЛАКТИКА.\n• Пероральное железо, отменить за 7 дней до колоноскопии.\n• НЕТ необходимости отменять другие лекарства – принимать до 12 часов до теста.", prompt: "A medical infographic showing medication instructions." },
      { title: "Ваш график", description: "Начинается [DATE1]. Следуйте этому визуальному обзору.", prompt: "A medical infographic showing a timeline for colonoscopy preparation with icons for diet and hydration." },
      { title: "Дни 1 и 2", description: "Дни [DATE1] и [DATE2]. РАЗРЕШЕНО: Нежирное мясо, рис, яйца. ЗАПРЕЩЕНО: Фрукты и овощи.", prompt: "A healthy meal plate with white rice, a boiled egg, and grilled chicken breast. No vegetables or fruits." },
      { title: "День 3", description: "День [DATE3]. Жидкая диета. Рекомендуется процеженный куриный бульон.", prompt: "A clear bowl of golden chicken broth and a glass of water on a clean table." },
      { title: "Набор Pleinvue", description: "PLEINVUE: Один большой пакет (Часть 1) и два маленьких А и Б (Часть 2).", prompt: "A professional medical box of Pleinvue laxative with sachets labeled Part 1 and Part 2." },
      { title: "Доза 1", description: "В [DATE_D1] в [TIME_D1]. Растворить в полулитре воды. Выпить два стакана с перерывом в 15 минут.", prompt: "A person's hand pouring a white powder from a sachet into a glass of water." },
      { title: "Гидратация", description: "Обязательно выпить еще два стакана (пол-литра) чистой воды.", prompt: "Two clean glasses filled with sparkling clear water on a blue background." },
      { title: "Доза 2", description: "В [DATE_D2] в [TIME_D2]. Смешать А+Б в полулитре. Техника маленьких глотков. Пауза 10-15 мин.", prompt: "Two small sachets being mixed into a large glass of water." },
      { title: "СТОП ВОДА", description: "С [TIME_STOP] [DATE_STOP]. НИЧЕГО НЕ ПИТЬ.", prompt: "A minimalist red warning sign with a water drop icon crossed out." },
      { title: "Важно", description: "• Не пейте алкоголь, молоко или что-либо красного или фиолетового цвета (например, ягодный сок) или другие напитки с мякотью.\n• Не ешьте во время приема Pleinvue® и до окончания клинической процедуры.\n• Вы не сможете водить машину в день колоноскопии или управлять опасными механизмами.\n• ПРИНЕСИТЕ ПОДПИСАННЫЕ СОГЛАСИЯ НА КОЛОНОСКОПИЮ И СЕДАЦИЮ.\n• Приходите на обследование в сопровождении человека, который сможет вести машину или помочь вам вернуться домой.\n• Существует вероятность того, что в случае терапевтических вмешательств, таких как удаление полипов, вам придется отменить свои планы на следующий день, или вам может потребоваться остаться под наблюдением на 24 часа (эта ситуация редко бывает необходимой).", prompt: "A medical infographic showing important instructions." },
      { title: "Удачи", description: "Доктор Нардулли желает вам спокойного обследования.", prompt: "A friendly doctor smiling in a professional clinic setting, giving a thumbs up." }
    ],
    narrative: [
      "Медикаменты. Вы должны приостановить прием Аспирина или других ингибиторов агрегации тромбоцитов, таких как Adiro, Iscover, Disgren, Tiklid или Plavix, за 3-8 дней до исследования. Проконсультируйтесь с врачом, если у вас есть сомнения. В случае приема Sintrom или другого антикоагулянта, такого как Xarelto или Pradaxa, вы должны проконсультироваться с врачом для оценки его отмены или замены. При сердечной патологии принесите электрокардиограмму, эхокардиограмму и указания вашего кардиолога. Сообщите, если требуется антибиотикопрофилактика. Пероральное железо необходимо отменить за 7 дней до колоноскопии. Нет необходимости отменять другие лекарства, вы можете принимать их до 12 часов до теста.",
      "Добро пожаловать. Ваша подготовка начинается [DATE1]. Вот инфографика с визуальным обзором всех этапов.",
      "Дни первый и второй, [DATE1] и [DATE2]. Строгая диета без клетчатки. Можно есть макароны, рис, яйца, мясо и рыбу. Запрещено есть фрукты, овощи или салаты.",
      "День третий, [DATE3]. Исключительно жидкая диета. Процеженные бульоны, настои и вода. Рекомендуется куриный бульон. Избегайте красных жидкостей.",
      "Препарат, выбранный вашим врачом для очистки кишечника, — PLEINVUE. В его коробке находится большой пакет, который будет первой частью подготовки, и два маленьких пакета, А и Б, которые будут второй частью.",
      "Первая доза [DATE_D1] в [TIME_D1]. Растворите большой пакет в полулитре воды. Выпейте два стакана с интервалом в 15 минут.",
      "Гидратация. Обязательно выпить еще два стакана, примерно пол-литра, чистой воды после первой дозы.",
      "Вторая доза [DATE_D2] в [TIME_D2]. Смешайте пакеты А и Б, разведенные в полулитре воды. Используйте технику маленьких глотков: маленький глоток, затем вода. Подождите от десяти до пятнадцати минут между глотками.",
      "Внимание. Полная остановка в [TIME_STOP] [DATE_STOP]. Полностью прекратите пить для анестезии.",
      "Важно. Не пейте алкоголь, молоко или что-либо красного или фиолетового цвета, например, ягодный сок, или другие напитки с мякотью. Не ешьте во время приема Pleinvue и до окончания клинической процедуры. Вы не сможете водить машину в день колоноскопии или управлять опасными механизмами. Не забудьте принести подписанные согласия на колоноскопию и седацию. Приходите на обследование в сопровождении человека, который сможет вести машину или помочь вам вернуться домой. Существует вероятность того, что в случае терапевтических вмешательств, таких как удаление полипов, вам придется отменить свои планы на следующий день, или вам может потребоваться остаться под наблюдением на 24 часа, хотя эта ситуация редко бывает необходимой.",
      "Мы закончили. Доктор Нардулли и его команда желают вам удачи. Всего доброго!"
    ]
  },
  uk: {
    welcome: "Вітаю. Я ваш віртуальний помічник. Щоб скласти ваш персональний план підготовки, будь ласка, введіть дату та час прийому.",
    dateLabel: "Дата прийому",
    timeLabel: "Час прийому",
    calcBtn: "Скласти план",
    planTitle: "Ваша підготовка",
    repeatBtn: "Повторити",
    next: "Далі",
    prev: "Назад",
    startAssistant: "ЗАПУСТИТИ ПОМІЧНИКА",
    doctorTitle: "Гастроентеролог",
    screens: [
      { title: "Медикаменти", description: "• Призупинити прийом Аспірину або інших інгібіторів агрегації тромбоцитів, таких як Adiro®, Iscover®, Disgren®, Tiklid®, Plavix®, за 3-8 днів до обстеження – проконсультуйтеся з лікарем при сумнівах.\n• У разі прийому Sintrom® або іншого антикоагулянту (Xarelto®, Pradaxa®...), проконсультуйтеся з лікарем для оцінки його відміни або заміни.\n• При серцевій патології: Принесіть електрокардіограму, ехокардіограму та вказівки вашого кардіолога. ПОВІДОМТЕ, ЯКЩО ПОТРІБНА АНТИБІОТИКОПРОФІЛАКТИКА.\n• Пероральне залізо, відмінити за 7 днів до колоноскопії.\n• НЕМАЄ необхідності відміняти інші ліки – приймати до 12 годин до тесту.", prompt: "A medical infographic showing medication instructions." },
      { title: "Ваш графік", description: "Починається [DATE1]. Дотримуйтесь цього візуального огляду.", prompt: "A medical infographic showing a timeline for colonoscopy preparation with icons for diet and hydration." },
      { title: "Дні 1 і 2", description: "Дні [DATE1] і [DATE2]. ДОЗВОЛЕНО: Нежирне м'ясо, рис, яйця. ЗАБОРОНЕНО: Фрукти та овочі.", prompt: "A healthy meal plate with white rice, a boiled egg, and grilled chicken breast. No vegetables or fruits." },
      { title: "День 3", description: "День [DATE3]. Рідка дієта. Рекомендується проціджений курячий бульйон.", prompt: "A clear bowl of golden chicken broth and a glass of water on a clean table." },
      { title: "Набір Pleinvue", description: "PLEINVUE: Один великий пакет (Частина 1) та два маленькі А і Б (Частина 2).", prompt: "A professional medical box of Pleinvue laxative with sachets labeled Part 1 and Part 2." },
      { title: "Доза 1", description: "В [DATE_D1] о [TIME_D1]. Розчинити в півлітрі води. Випити два стакани з перервою в 15 хвилин.", prompt: "A person's hand pouring a white powder from a sachet into a glass of water." },
      { title: "Гідратація", description: "Обов'язково випити ще два стакани (півлітра) чистої води.", prompt: "Two clean glasses filled with sparkling clear water on a blue background." },
      { title: "Доза 2", description: "В [DATE_D2] о [TIME_D2]. Змішати А+Б у півлітрі. Техніка маленьких ковтків. Пауза 10-15 хв.", prompt: "Two small sachets being mixed into a large glass of water." },
      { title: "СТОП ВОДА", description: "З [TIME_STOP] [DATE_STOP]. НІЧОГО НЕ ПИТИ.", prompt: "A minimalist red warning sign with a water drop icon crossed out." },
      { title: "Важливо", description: "• Не пийте алкоголь, молоко або будь-що червоного чи фіолетового кольору (наприклад, ягідний сік) або інші напої з м'якоттю.\n• Не їжте під час прийому Pleinvue® і до закінчення клінічної процедури.\n• Ви не зможете керувати автомобілем в день колоноскопії або керувати небезпечними механізмами.\n• ПРИНЕСІТЬ ПІДПИСАНІ ЗГОДИ НА КОЛОНОСКОПІЮ ТА СЕДАЦІЮ.\n• Приходьте на обстеження у супроводі людини, яка зможе вести машину або допомогти вам повернутися додому.\n• Існує ймовірність того, що у разі терапевтичних втручань, таких як видалення поліпів, вам доведеться скасувати свої плани на наступний день, або вам може знадобитися залишитися під наглядом на 24 години (ця ситуація рідко буває необхідною).", prompt: "A medical infographic showing important instructions." },
      { title: "Успіху", description: "Доктор Нардуллі бажає вам спокійного обстеження.", prompt: "A friendly doctor smiling in a professional clinic setting, giving a thumbs up." }
    ],
    narrative: [
      "Медикаменти. Ви повинні призупинити прийом Аспірину або інших інгібіторів агрегації тромбоцитів, таких як Adiro, Iscover, Disgren, Tiklid або Plavix, за 3-8 днів до обстеження. Проконсультуйтеся з лікарем, якщо у вас є сумніви. У разі прийому Sintrom або іншого антикоагулянту, такого як Xarelto або Pradaxa, ви повинні проконсультуватися з лікарем для оцінки його відміни або заміни. При серцевій патології принесіть електрокардіограму, ехокардіограму та вказівки вашого кардіолога. Повідомте, якщо потрібна антибіотикопрофілактика. Пероральне залізо необхідно відмінити за 7 днів до колоноскопії. Немає необхідності відміняти інші ліки, ви можете приймати їх до 12 годин до тесту.",
      "Вітаємо. Ваша підготовка починається [DATE1]. Ось інфографіка з візуальним оглядом усіх етапів.",
      "Дні перший і другий, [DATE1] і [DATE2]. Сувора дієта без клітковини. Можна їсти макарони, рис, яйця, м'ясо і рибу. Заборонено їсти фрукти, овочі або салати.",
      "День третій, [DATE3]. Виключно рідка дієта. Проціджені бульйони, настої та вода. Рекомендується курячий бульйон. Уникайте червоних рідин.",
      "Препарат, обраний вашим лікарем для очищення кишечника, — PLEINVUE. У його коробці знаходиться великий пакет, який буде першою частиною підготовки, і два маленьких пакети, А і Б, які будуть другою частиною.",
      "Перша доза [DATE_D1] о [TIME_D1]. Розчиніть великий пакет у півлітрі води. Випийте два стакани з інтервалом у 15 хвилин.",
      "Гідратація. Обов'язково випити ще два стакани, приблизно півлітра, чистої води після першої дози.",
      "Друга доза [DATE_D2] о [TIME_D2]. Змішайте пакети А і Б, розведені в півлітрі води. Використовуйте техніку маленьких ковтків: маленький ковток, потім вода. Зачекайте від десяти до п'ятнадцяти хвилин між ковтками.",
      "Увага. Повна зупинка о [TIME_STOP] [DATE_STOP]. Повністю припиніть пити для анестезії.",
      "Важливо. Не пийте алкоголь, молоко або будь-що червоного чи фіолетового кольору, наприклад, ягідний сік, або інші напої з м'якоттю. Не їжте під час прийому Pleinvue і до закінчення клінічної процедури. Ви не зможете керувати автомобілем в день колоноскопії або керувати небезпечними механізмами. Не забудьте принести підписані згоди на колоноскопію та седацию. Приходьте на обстеження у супроводі людини, яка зможе вести машину або допомогти вам повернутися додому. Існує ймовірність того, що у разі терапевтичних втручань, таких як видалення поліпів, вам доведеться скасувати свої плани на наступний день, або вам може знадобитися залишитися під наглядом на 24 години, хоча ця ситуація рідко буває необхідною.",
      "Ми закінчили. Доктор Нардуллі та його команда бажають вам успіху. Хай щастить!"
    ]
  },
  zh: {
    welcome: "你好。我是您的虚拟助手。请输入您的预约日期 and 时间，以生成您的个性化准备计划。",
    dateLabel: "预约日期",
    timeLabel: "预约时间",
    calcBtn: "生成计划",
    planTitle: "您的准备",
    repeatBtn: "重复",
    next: "下一步",
    prev: "上一步",
    startAssistant: "启动助手",
    doctorTitle: "胃肠病学家",
    screens: [
      { title: "药物", description: "• 检查前 3 至 8 天暂停服用阿司匹林或其他血小板聚集抑制剂，如 Adiro®、Iscover®、Disgren®、Tiklid®、Plavix® – 如有疑问，请咨询您的医生。\n• 如果服用 Sintrom® 或其他抗凝剂（Xarelto®、Pradaxa®...），请咨询您的医生以评估其暂停或替代。\n• 如果您患有心脏病：请携带您的心电图、超声心动图和心脏病专家的指示。如果需要抗生素预防，请告知。\n• 口服铁剂，在结肠镜检查前 7 天暂停。\n• 不需要暂停其他药物 – 可以在检查前 12 小时服用。", prompt: "A medical infographic showing medication instructions." },
      { title: "您的时间表", description: "从 [DATE1] 开始。请遵循此视觉总结。", prompt: "A medical infographic showing a timeline for colonoscopy preparation with icons for diet and hydration." },
      { title: "第1和2天", description: "[DATE1] 和 [DATE2]。允许：瘦肉、米饭、鸡蛋。禁止：水果和蔬菜。", prompt: "A healthy meal plate with white rice, a boiled egg, and grilled chicken breast. No vegetables or fruits." },
      { title: "第3天", description: "[DATE3]。流质饮食。推荐滤过的鸡汤。", prompt: "A clear bowl of golden chicken broth and a glass of water on a clean table." },
      { title: "Pleinvue 套装", description: "PLEINVUE：一大袋（第1部分）和两小袋 A 和 B（第2部分）。", prompt: "A professional medical box of Pleinvue laxative with sachets labeled Part 1 and Part 2." },
      { title: "第1剂", description: "在 [DATE_D1] 的 [TIME_D1]。溶解在半升水中。分两次饮用，间隔15分钟。", prompt: "A person's hand pouring a white powder from a sachet into a glass of water." },
      { title: "补水", description: "必须再喝两杯（半升）清水。", prompt: "Two clean glasses filled with sparkling clear water on a blue background." },
      { title: "第2剂", description: "在 [DATE_D2] 的 [TIME_D2]。将 A+B 混合在半升水中。小口饮用。间隔10-15分钟。", prompt: "Two small sachets being mixed into a large glass of water." },
      { title: "停止饮水", description: "从 [DATE_STOP] 的 [TIME_STOP] 开始。不要喝任何东西。", prompt: "A minimalist red warning sign with a water drop icon crossed out." },
      { title: "重要", description: "• 不要饮酒、牛奶或任何红色或紫色的东西（例如浆果汁）或其他含有果肉的饮料。\n• 服用 Pleinvue® 期间直到临床程序结束后不要进食。\n• 结肠镜检查当天您将无法驾驶或操作危险机械。\n• 携带签署的结肠镜检查和镇静同意书。\n• 在可以驾驶或协助您回家的人的陪同下进行检查。\n• 如果进行治疗性干预（如息肉切除），您可能需要取消第二天的承诺，或者您可能需要留院观察 24 小时（这种情况很少需要）。", prompt: "A medical infographic showing important instructions." },
      { title: "祝您好运", description: "Nardulli 医生祝您检查顺利。", prompt: "A friendly doctor smiling in a professional clinic setting, giving a thumbs up." }
    ],
    narrative: [
      "药物。您必须在检查前 3 至 8 天暂停服用阿司匹林或其他血小板聚集抑制剂，如 Adiro、Iscover、Disgren、Tiklid 或 Plavix。如有疑问，请咨询您的医生。如果您服用 Sintrom 或其他抗凝剂，如 Xarelto 或 Pradaxa，您必须咨询您的医生以评估其暂停或替代。如果您患有心脏病，请携带您的心电图、超声心动图和心脏病专家的指示。如果需要抗生素预防，请告知。口服铁剂必须在结肠镜检查前 7 天暂停。不需要暂停其他药物，您可以在检查前 12 小时服用。",
      "欢迎。您的准备工作从 [DATE1] 开始。这是包含所有阶段视觉总结的图表。",
      "第一天和第二天，即 [DATE1] 和 [DATE2]。严格的无纤维饮食。您可以吃面条、米饭、鸡蛋、肉和鱼。禁止吃水果、蔬菜或沙拉。",
      "第三天，即 [DATE3]。全流食。过滤的肉汤、茶和水。推荐鸡汤。避免红色液体。",
      "您的医生为您选择的肠道清洁产品是 PLEINVUE。包装盒内有一个大袋（准备工作的第一部分）和两个小袋 A 和 B（第二部分）。",
      "第一剂在 [DATE_D1] 的 [TIME_D1]。将大袋溶解在半升水中。分两杯饮用，间隔15分钟。",
      "补水。在第一剂后，必须再喝两杯（约半升）清水。",
      "第二剂在 [DATE_D2] 的 [TIME_D2]。将 A 袋和 B 袋溶解在半升水中。使用小口饮用的技巧：小口喝药，然后喝水。每口之间等待十到十五分钟。",
      "注意。在 [DATE_STOP] 的 [TIME_STOP] 完全停止。为了麻醉，请完全停止饮水。",
      "重要。不要饮酒、牛奶或任何红色或紫色的东西，例如浆果汁，或其他含有果肉的饮料。服用 Pleinvue 期间直到临床程序结束后不要进食。结肠镜检查当天您将无法驾驶或操作危险机械。记得携带签署的结肠镜检查和镇静同意书。在可以驾驶或协助您回家的人的陪同下进行检查。如果进行治疗性干预，如息肉切除，您可能需要取消第二天的承诺，或者您可能需要留院观察 24 小时，尽管这种情况很少需要。",
      "我们完成了。Nardulli 医生及其团队祝您检查顺利。加油！"
    ]
  },
  sv: {
    welcome: "Hej. Jag är din virtuella assistent. För att skapa din personliga förberedelseplan, vänligen ange datum och tid för ditt besök.",
    dateLabel: "Besöksdatum",
    timeLabel: "Besökstid",
    calcBtn: "Skapa plan",
    planTitle: "Din förberedelse",
    repeatBtn: "Upprepa",
    next: "Nästa",
    prev: "Föregående",
    startAssistant: "STARTA ASSISTENT",
    doctorTitle: "Gastroenterolog",
    screens: [
      { title: "Läkemedel", description: "• Avbryt Aspirin eller andra trombocytaggregationshämmare som Adiro®, Iscover®, Disgren®, Tiklid®, Plavix® mellan 3 och 8 dagar före undersökningen – rådfråga din läkare om du är osäker.\n• Om du tar Sintrom® eller annat antikoagulantia (Xarelto®, Pradaxa®...) måste du rådfråga din läkare för att bedöma om det ska sättas ut eller bytas ut.\n• Vid hjärtsjukdom: Ta med ditt elektrokardiogram, ekokardiogram och din kardiologs anvisningar. MEDDELA OM ANTIBIOTIKAPROFYLAX KRÄVS.\n• Oralt järn, avbryt 7 dagar före koloskopin.\n• Det är INTE nödvändigt att avbryta andra mediciner – ta upp till 12 timmar före testet.", prompt: "A medical infographic showing medication instructions." },
      { title: "Ditt schema", description: "Börjar [DATE1]. Följ denna visuella sammanfattning.", prompt: "A medical infographic showing a timeline for colonoscopy preparation with icons for diet and hydration." },
      { title: "Dag 1 och 2", description: "[DATE1] och [DATE2]. TILLÅTET: Magert kött, ris, ägg. FÖRBJUDET: Frukt och grönsaker.", prompt: "A healthy meal plate with white rice, a boiled egg, and grilled chicken breast. No vegetables or fruits." },
      { title: "Dag 3", description: "Dag [DATE3]. Flytande kost. Silad kycklingbuljong rekommenderas.", prompt: "A clear bowl of golden chicken broth and a glass of water on a clean table." },
      { title: "Pleinvue-kit", description: "PLEINVUE: En stor påse (Del 1) och två små A och B (Del 2).", prompt: "A professional medical box of Pleinvue laxative with sachets labeled Part 1 and Part 2." },
      { title: "Dos 1", description: "Den [DATE_D1] kl [TIME_D1]. Lös upp i en halv liter vatten. Drick i två glas med 15 minuters paus.", prompt: "A person's hand pouring a white powder from a sachet into a glass of water." },
      { title: "Vätska", description: "Obligatoriskt att dricka ytterligare två glas (en halv liter) klart vatten.", prompt: "Two clean glasses filled with sparkling clear water on a blue background." },
      { title: "Dos 2", description: "Den [DATE_D2] kl [TIME_D2]. Blanda A+B i en halv liter. Smutteknik. Paus 10-15 min.", prompt: "Two small sachets being mixed into a large glass of water." },
      { title: "STOPP VATTEN", description: "Från [TIME_STOP] den [DATE_STOP]. DRICK INGENTING.", prompt: "A minimalist red warning sign with a water drop icon crossed out." },
      { title: "Viktigt", description: "• Drick inte alkohol, mjölk eller något rött eller lila (t.ex. bärjuice) eller andra drycker som innehåller fruktkött.\n• Ät inte medan du tar Pleinvue® och förrän efter det kliniska ingreppet.\n• Du kommer inte att kunna köra bil på dagen för koloskopin eller använda farliga maskiner.\n• TA MED DE UNDERTECKNADE SAMTYCKENA FÖR KOLOSKOPI OCH SEDERING.\n• Kom i sällskap till undersökningen med någon som kan köra eller hjälpa dig på hemresan.\n• Det finns en möjlighet att du vid terapeutiska ingrepp, såsom borttagning av polyper, kan behöva ställa in dina åtaganden nästa dag, eller så kan du behöva stanna för observation i 24 timmar (denna situation är sällan nödvändig).", prompt: "A medical infographic showing important instructions." },
      { title: "Lycka till", description: "Dr. Nardulli önskar dig en smidig undersökning.", prompt: "A friendly doctor smiling in a professional clinic setting, giving a thumbs up." }
    ],
    narrative: [
      "Läkemedel. Du måste avbryta Aspirin eller andra trombocytaggregationshämmare som Adiro, Iscover, Disgren, Tiklid eller Plavix mellan 3 och 8 dagar före undersökningen. Rådfråga din läkare om du är osäker. Om du tar Sintrom eller annat antikoagulantia som Xarelto eller Pradaxa måste du rådfråga din läkare för att bedöma om det ska sättas ut eller bytas ut. Vid hjärtsjukdom, ta med ditt elektrokardiogram, ekokardiogram och din kardiologs anvisningar. Meddela om antibiotikaprofylax krävs. Oralt järn måste avbrytas 7 dagar före koloskopin. Det är inte nödvändigt att avbryta andra mediciner, du kan ta dem upp till 12 timmar före testet.",
      "Välkommen. Din förberedelse börjar den [DATE1]. Här är infografiken med den visuella sammanfattningen av alla faser.",
      "Dag ett och två, den [DATE1] och [DATE2]. Strikt fiberfri kost. Du kan äta pasta, ris, ägg, kött och fisk. Förbjudet att äta frukt, grönsaker eller sallader.",
      "Dag tre, den [DATE3]. Uteslutande flytande kost. Silad buljong, te och vatten. Kycklingbuljong rekommenderas. Undvik röda vätskor.",
      "Produkten som din läkare har valt för tarmrengöring är PLEINVUE. I förpackningen finns en stor påse som är den första delen, och två små påsar, A och B, som är den andra delen.",
      "Första dosen den [DATE_D1] klockan [TIME_D1]. Lös upp den stora påsen i en halv liter vatten. Drick i zwei glas med 15 minuters mellanrum.",
      "Vätska. Det är obligatoriskt att dricka ytterligare zwei glas, cirka en halv liter, klart vatten efter den första dosen.",
      "Andra dosen den [DATE_D2] klockan [TIME_D2]. Blanda påsarna A och B utspädda i en halv liter vatten. Använd smuttekniken: liten klunk, följt av vatten. Vänta tio till femton minuter mellan klunkarna.",
      "Observera. Totalt stopp klockan [TIME_STOP] den [DATE_STOP]. Sluta dricka helt inför narkosen.",
      "Viktigt. Drick inte alkohol, mjölk eller något rött eller lila, såsom bärjuice, eller andra drycker som innehåller fruktkött. Ät inte medan du tar Pleinvue och förrän efter det kliniska ingreppet. Du kommer inte att kunna köra bil på dagen för koloskopin eller använda farliga maskiner. Kom ihåg att ta med de undertecknade samtyckena för koloskopi och sedering. Kom i sällskap till undersökningen med någon som kan köra eller hjälpa dig på hemresan. Det finns en möjlighet att du vid terapeutiska ingrepp, såsom borttagning av polyper, kan behöva ställa in dina åtaganden nästa dag, eller så kan du behöva stanna för observation i 24 timmar, även om denna situation sällan är nödvändig.",
      "Vi är klara. Dr. Nardulli och hans team önskar dig lycka till. Kämpa på!"
    ]
  },
  ar: {
    welcome: "مرحباً. أنا مساعدك الافتراضي. لإنشاء خطة التحضير المخصصة لك، يرجى إدخال تاريخ ووقت موعدك.",
    dateLabel: "تاريخ الموعد",
    timeLabel: "وقت الموعد",
    calcBtn: "إنشاء الخطة",
    planTitle: "تحضيرك",
    repeatBtn: "تكرار",
    next: "التالي",
    prev: "السابق",
    startAssistant: "بدء المساعد",
    doctorTitle: "أخصائي أمراض الجهاز الهضمي",
    screens: [
      { title: "الأدوية", description: "• أوقف الأسبرين أو مثبطات تراكم الصفائح الدموية الأخرى مثل Adiro®، Iscover®، Disgren®، Tiklid®، Plavix® بين 3 و 8 أيام قبل الفحص - استشر طبيبك إذا كان لديك شك.\n• في حالة تناول Sintrom® أو مضاد تخثر آخر (Xarelto®، Pradaxa®...) يجب استشارة طبيبك لتقييم إيقافه أو استبداله.\n• في حالة الإصابة بأمراض القلب: أحضر مخطط كهربية القلب، مخطط صدى القلب وتعليمات طبيب القلب الخاص بك. أبلغ إذا كانت الوقاية بالمضادات الحيوية مطلوبة.\n• الحديد الفموي، أوقفه قبل 7 أيام من تنظير القولون.\n• ليس من الضروري إيقاف الأدوية الأخرى - تناولها حتى 12 ساعة قبل الاختبار.", prompt: "A medical infographic showing medication instructions." },
      { title: "جدولك الزمني", description: "يبدأ في [DATE1]. اتبع هذا الملخص المرئي.", prompt: "A medical infographic showing a timeline for colonoscopy preparation with icons for diet and hydration." },
      { title: "اليومان 1 و 2", description: "[DATE1] و [DATE2]. مسموح: لحم خالي من الدهون، أرز، بيض. ممنوع: فواكه وخضروات.", prompt: "A healthy meal plate with white rice, a boiled egg, and grilled chicken breast. No vegetables or fruits." },
      { title: "اليوم 3", description: "اليوم [DATE3]. نظام غذائي سائل. يوصى بمرق الدجاج المصفى.", prompt: "A clear bowl of golden chicken broth and a glass of water on a clean table." },
      { title: "مجموعة Pleinvue", description: "PLEINVUE: كيس كبير (الجزء 1) وكيسان صغيران A و B (الجزء 2).", prompt: "A professional medical box of Pleinvue laxative with sachets labeled Part 1 and Part 2." },
      { title: "الجرعة 1", description: "في [DATE_D1] الساعة [TIME_D1]. يذوب في نصف لتر. يشرب في كأسين مع استراحة 15 دقيقة.", prompt: "A person's hand pouring a white powder from a sachet into a glass of water." },
      { title: "الترطيب", description: "من الضروري شرب كأسين آخرين (نصف لتر) من الماء الصافي.", prompt: "Two clean glasses filled with sparkling clear water on a blue background." },
      { title: "الجرعة 2", description: "في [DATE_D2] الساعة [TIME_D2]. اخلط A+B في نصف لتر. تقنية الرشفات. استراحة 10-15 دقيقة.", prompt: "Two small sachets being mixed into a large glass of water." },
      { title: "توقف عن شرب الماء", description: "بدءاً من [TIME_STOP] في [DATE_STOP]. لا تشرب أي شيء.", prompt: "A minimalist red warning sign with a water drop icon crossed out." },
      { title: "هام", description: "• لا تشرب الكحول، الحليب، أو أي شيء أحمر أو أرجواني (على سبيل المثال، عصير التوت) أو المشروبات الأخرى التي تحتوي على اللب.\n• لا تأكل أثناء تناول Pleinvue® وحتى بعد الإجراء السريري.\n• لن تتمكن من القيادة في يوم تنظير القولون أو تشغيل الآلات الخطرة.\n• أحضر موافقات تنظير القولون والتخدير الموقعة.\n• تعال برفقة شخص إلى الفحص يمكنه القيادة أو مساعدتك في عودتك إلى المنزل.\n• هناك احتمال أنه في حالة التدخلات العلاجية، مثل إزالة السلائل، قد تحتاج إلى إلغاء التزاماتك في اليوم التالي، أو قد تحتاج إلى البقاء تحت المراقبة لمدة 24 ساعة (هذا الوضع نادرا ما يكون ضروريا).", prompt: "A medical infographic showing important instructions." },
      { title: "حظاً موفقاً", description: "يتمنى لك الدكتور ناردولي فحصاً مريحاً.", prompt: "A friendly doctor smiling in a professional clinic setting, giving a thumbs up." }
    ],
    narrative: [
      "الأدوية. يجب إيقاف الأسبرين أو مثبطات تراكم الصفائح الدموية الأخرى مثل أديرا، إيسكوفر، ديسغرين، تيكليد، أو بلافيكس بين 3 و 8 أيام قبل الفحص. استشر طبيبك إذا كان لديك شك. في حالة تناول سينتروم أو مضاد تخثر آخر مثل زاريلتو أو براداكسا، يجب استشارة طبيبك لتقييم إيقافه أو استبداله. في حالة الإصابة بأمراض القلب، أحضر مخطط كهربية القلب، مخطط صدى القلب وتعليمات طبيب القلب الخاص بك. أبلغ إذا كانت الوقاية بالمضادات الحيوية مطلوبة. يجب إيقاف الحديد الفموي قبل 7 أيام من تنظير القولون. ليس من الضروري إيقاف الأدوية الأخرى، يمكنك تناولها حتى 12 ساعة قبل الاختبار.",
      "مرحباً. يبدأ تحضيرك في [DATE1]. إليك الرسم البياني الذي يحتوي على الملخص المرئي لجميع المراحل.",
      "اليومان الأول والثاني، في [DATE1] و [DATE2]. نظام غذائي صارم بدون ألياف. يمكنك تناول المعكرونة، الأرز، البيض، اللحوم والأسماك. يمنع تناول الفواكه أو الخضروات أو السلطات.",
      "اليوم الثالث، في [DATE3]. نظام غذائي سائل حصرياً. مرق مصفى، شاي وماء. يوصى بمرق الدجاج. تجنب السوائل الحمراء.",
      "المنتج الذي اختاره طبيبك لتنظيف القولون هو PLEINVUE. تحتوي علبته على كيس كبير سيكون الجزء الأول من التحضير، وكيسين صغيرين، A و B، سيكونان الجزء الثاني.",
      "الجرعة الأولى في [DATE_D1] الساعة [TIME_D1]. قم بإذابة الكيس الكبير في نصف لتر من الماء. اشربه في كأسين يفصل بينهما 15 دقيقة.",
      "الترطيب. من الضروري شرب كأسين آخرين، حوالي نصف لتر، من الماء الصافي بعد الجرعة الأولى.",
      "الجرعة الثانية في [DATE_D2] الساعة [TIME_D2]. اخلط الكيسين A و B مخففين في نصف لتر من الماء. استخدم تقنية الرشفات: رشفة صغيرة، يتبعها الماء. انتظر من عشر إلى خمس عشرة دقيقة بين الرشفات.",
      "انتباه. توقف تام في الساعة [TIME_STOP] من يوم [DATE_STOP]. توقف عن الشرب تماماً من أجل التخدير.",
      "هام. لا تشرب الكحول، الحليب، أو أي شيء أحمر أو أرجواني، مثل عصير التوت، أو المشروبات الأخرى التي تحتوي على اللب. لا تأكل أثناء تناول بلينفيو وحتى بعد الإجراء السريري. لن تتمكن من القيادة في يوم تنظير القولون أو تشغيل الآلات الخطرة. تذكر إحضار موافقات تنظير القولون والتخدير الموقعة. تعال برفقة شخص إلى الفحص يمكنه القيادة أو مساعدتك في عودتك إلى المنزل. هناك احتمال أنه في حالة التدخلات العلاجية، مثل إزالة السلائل، قد تحتاج إلى إلغاء التزاماتك في اليوم التالي، أو قد تحتاج إلى البقاء تحت المراقبة لمدة 24 ساعة، على الرغم من أن هذا الوضع نادرا ما يكون ضروريا.",
      "لقد انتهينا. يتمنى لك الدكتور ناردولي وفريقه تجربة جيدة. بالتوفيق!"
    ]
  },
  no: {
    welcome: "Hei. Jeg er din virtuelle assistent. For å generere din personlige forberedelsesplan, vennligst oppgi dato og klokkeslett for din avtale.",
    dateLabel: "Avtaledato",
    timeLabel: "Avtaletid",
    calcBtn: "Generer plan",
    planTitle: "Din forberedelse",
    repeatBtn: "Gjenta",
    next: "Neste",
    prev: "Forrige",
    startAssistant: "START ASSISTENT",
    doctorTitle: "Gastroenterolog",
    screens: [
      { title: "Medisiner", description: "• Avbryt Aspirin eller andre platehemmere som Adiro®, Iscover®, Disgren®, Tiklid®, Plavix® mellom 3 og 8 dager før undersøkelsen – kontakt legen din hvis du er i tvil.\n• Hvis du tar Sintrom® eller andre antikoagulantia (Xarelto®, Pradaxa®...), må du kontakte legen din for å vurdere om det skal seponeres eller byttes ut.\n• Ved hjertesykdom: Ta med EKG, ekkokardiogram og kardiologens instruksjoner. GI BESKJED HVIS ANTIBIOTIKAPROFYLAKSE ER NØDVENDIG.\n• Oralt jern, avbryt 7 dager før koloskopien.\n• Det er IKKE nødvendig å avbryte andre medisiner – ta inntil 12 timer før testen.", prompt: "A medical infographic showing medication instructions." },
      { title: "Din tidslinje", description: "Starter [DATE1]. Følg dette visuelle sammendraget.", prompt: "A medical infographic showing a timeline for colonoscopy preparation with icons for diet and hydration." },
      { title: "Dag 1 og 2", description: "[DATE1] og [DATE2]. TILLATT: Magert kjøtt, ris, egg. FORBUDT: Frukt og grønnsaker.", prompt: "A healthy meal plate with white rice, a boiled egg, and grilled chicken breast. No vegetables or fruits." },
      { title: "Dag 3", description: "Dag [DATE3]. Flytende diett. Silt kyllingkraft anbefales.", prompt: "A clear bowl of golden chicken broth and a glass of water on a clean table." },
      { title: "Pleinvue-sett", description: "PLEINVUE: En stor pose (Del 1) og to små A og B (Del 2).", prompt: "A professional medical box of Pleinvue laxative with sachets labeled Part 1 and Part 2." },
      { title: "Dose 1", description: "Den [DATE_D1] kl [TIME_D1]. Løs opp i en halv liter vann. Drikk i to glass med 15 min pause.", prompt: "A person's hand pouring a white powder from a sachet into a glass of water." },
      { title: "Væske", description: "Obligatorisk å drikke to ekstra glass (en halv liter) klart vann.", prompt: "Two clean glasses filled with sparkling clear water on a blue background." },
      { title: "Dose 2", description: "Den [DATE_D2] kl [TIME_D2]. Bland A+B i en halv liter. Slurketeknikk. Pause 10-15 min.", prompt: "Two small sachets being mixed into a large glass of water." },
      { title: "STOPP VANN", description: "Fra [TIME_STOP] den [DATE_STOP]. IKKE DRIKK NOE.", prompt: "A minimalist red warning sign with a water drop icon crossed out." },
      { title: "Viktig", description: "• Ikke drikk alkohol, melk eller noe rødt eller lila (f.eks. bærjuice) eller andre drikker som inneholder fruktkjøtt.\n• Ikke spis mens du tar Pleinvue® og før etter den kliniske prosedyren.\n• Du vil ikke kunne kjøre bil på dagen for koloskopien eller betjene farlige maskiner.\n• TA MED SIGNERT SAMTYKKE FOR KOLOSKOPI OG SEDASJON.\n• Kom i følge til undersøkelsen med noen som kan kjøre eller hjelpe deg på hjemreisen.\n• Det er en mulighet for at du ved terapeutiske inngrep, som fjerning av polypper, kan måtte avlyse avtalene dine neste dag, eller du kan måtte bli til observasjon i 24 timer (denna situasjonen er sjelden nødvendig).", prompt: "A medical infographic showing important instructions." },
      { title: "Lykke til", description: "Dr. Nardulli ønsker deg en god undersøkelse.", prompt: "A friendly doctor smiling in a professional clinic setting, giving a thumbs up." }
    ],
    narrative: [
      "Medisiner. Du må avbryte Aspirin eller andre platehemmere som Adiro, Iscover, Disgren, Tiklid eller Plavix mellom 3 og 8 dager før undersøkelsen. Kontakt legen din hvis du er i tvil. Hvis du tar Sintrom eller andre antikoagulantia som Xarelto eller Pradaxa, må du kontakte legen din for å vurdere om det skal seponeres eller byttes ut. Ved hjertesykdom, ta med EKG, ekkokardiogram og kardiologens instruksjoner. Gi beskjed hvis antibiotikaprofylakse er nødvendig. Oralt jern må avbrytes 7 dager før koloskopien. Det er ikke nødvendig å avbryte andre medisiner, du kan ta dem inntil 12 timer før testen.",
      "Velkommen. Din forberedelse begynner den [DATE1]. Her er infografikken med det visuelle sammendraget av alle fasene.",
      "Dag en og to, den [DATE1] og [DATE2]. Streng fiberfri diett. Du kan spise pasta, ris, egg, kjøtt og fisk. Forbudt å spise frukt, grønnsaker eller salater.",
      "Dag tre, den [DATE3]. Utelukkende flytende diett. Silte kraftsupper, te og vann. Kyllingkraft anbefales. Unngå røde væsker.",
      "Produktet legen din har valgt for tarmrengjøring er PLEINVUE. Esken inneholder en stor pose for første del, og to små poser A og B for andre del.",
      "Første dose den [DATE_D1] klokken [TIME_D1]. Løs opp den store posen i en halv liter vann. Drikk i to glass med 15 minutters mellomrom.",
      "Væske. Det er obligatorisk å drikke ytterligere to glass, ca. en halv liter, rent vann etter den første dosen.",
      "Andre dose den [DATE_D2] klokken [TIME_D2]. Bland posene A og B fortynnet i en halv liter vann. Bruk slurketeknikken: liten slurk, etterfulgt av vann. Vent ti til femten minutter mellom slurkene.",
      "Advarsel. Totalt stopp klokken [TIME_STOP] den [DATE_STOP]. Slutt å drikke helt for anestesien.",
      "Viktig. Ikke drikk alkohol, melk eller noe rødt eller lila, som bærjuice, eller andre drikker som inneholder fruktkjøtt. Ikke spis mens du tar Pleinvue og før etter den kliniske prosedyren. Du vil ikke kunne kjøre bil på dagen for koloskopien eller betjene farlige maskiner. Husk å ta med signert samtykke for koloskopi og sedasjon. Kom i følge til undersøkelsen med noen som kan kjøre eller hjelpe deg på hjemreisen. Det er en mulighet for at du ved terapeutiske inngrep, som fjerning av polypper, kan måtte avlyse avtalene dine neste dag, eller du kan måtte bli til observasjon i 24 timer, selv om denne situasjonen sjelden er nødvendig.",
      "Vi er ferdige. Dr. Nardulli og hans team ønsker deg lykke til. Stå på!"
    ]
  },
  be: {
    welcome: "Hallo. Ik ben uw virtuele assistent. Om uw persoonlijk voorbereidingsplan te genereren, voert u de datum en tijd van uw afspraak in.",
    dateLabel: "Afspraakdatum",
    timeLabel: "Afspraakuur",
    calcBtn: "Plan genereren",
    planTitle: "Uw voorbereiding",
    repeatBtn: "Herhalen",
    next: "Volgende",
    prev: "Vorige",
    startAssistant: "START ASSISTENT",
    doctorTitle: "Gastro-enteroloog",
    screens: [
      { title: "Medicatie", description: "• Stop met Aspirine of andere bloedplaatjesremmers zoals Adiro®, Iscover®, Disgren®, Tiklid®, Plavix® tussen 3 en 8 dagen voor het onderzoek – raadpleeg uw arts bij twijfel.\n• Als u Sintrom® of een ander antistollingsmiddel (Xarelto®, Pradaxa®...) gebruikt, moet u uw arts raadplegen om te beoordelen of het moet worden gestopt of vervangen.\n• Bij hartaandoeningen: Breng uw elektrocardiogram, echocardiogram en de instructies van uw cardioloog mee. MELD HET ALS ANTIBIOTICAPROFYLAXE VEREIST IS.\n• Oraal ijzer, stop 7 dagen voor de coloscopie.\n• Het is NIET nodig om andere medicijnen te stoppen – neem tot 12 uur voor de test in.", prompt: "A medical infographic showing medication instructions." },
      { title: "Uw tijdlijn", description: "Start op [DATE1]. Volg dit visuele overzicht.", prompt: "A medical infographic showing a timeline for colonoscopy preparation with icons for diet and hydration." },
      { title: "Dag 1 en 2", description: "[DATE1] en [DATE2]. TOEGESTAAN: Mager vlees, rijst, eieren. VERBODEN: Fruit en groenten.", prompt: "A healthy meal plate with white rice, a boiled egg, and grilled chicken breast. No vegetables or fruits." },
      { title: "Dag 3", description: "Dag [DATE3]. Vloeibaar dieet. Gezeefde kippenbouillon aanbevolen.", prompt: "A clear bowl of golden chicken bouillon and a glass of water on a clean table." },
      { title: "Pleinvue-kit", description: "PLEINVUE: Eén groot zakje (Deel 1) en twee kleine zakjes A en B (Deel 2).", prompt: "A professional medical box of Pleinvue laxative with sachets labeled Part 1 and Part 2." },
      { title: "Dosis 1", description: "Op [DATE_D1] om [TIME_D1]. Oplossen in een halve liter water. Drink in twee glazen met 15 min pauze.", prompt: "A person's hand pouring a white powder from a sachet into a glass of water." },
      { title: "Hydratatie", description: "Verplicht om nog twee extra glazen (een halve liter) helder water te drinken.", prompt: "Two clean glasses filled with sparkling clear water on a blue background." },
      { title: "Dosis 2", description: "Op [DATE_D2] om [TIME_D2]. Meng A+B in een halve liter. Slokjestechniek. Pauze 10-15 min.", prompt: "Two small sachets being mixed into a large glass of water." },
      { title: "STOP WATER", description: "Vanaf [TIME_STOP] op [DATE_STOP]. NIETS DRINKEN.", prompt: "A minimalist red warning sign with a water drop icon crossed out." },
      { title: "Belangrijk", description: "• Drink geen alcohol, melk of iets roods of paars (bijv. bessensap) of andere dranken die vruchtvlees bevatten.\n• Eet niet tijdens het innemen van Pleinvue® en tot na de klinische procedure.\n• U mag op de dag van de coloscopie niet autorijden of gevaarlijke machines bedienen.\n• BRENG DE ONDERTEKENDE TOESTEMMINGSFORMULIEREN VOOR COLOSCOPIE EN SEDATIE MEE.\n• Kom onder begeleiding naar het onderzoek met iemand die kan rijden of u kan helpen bij uw terugkeer naar huis.\n• Er is een mogelijkheid dat u bij therapeutische ingrepen, zoals het verwijderen van poliepen, uw afspraken de volgende dag moet annuleren, of dat u 24 uur ter observatie moet blijven (deze situatie is zelden nodig).", prompt: "A medical infographic showing important instructions." },
      { title: "Veel succes", description: "Dr. Nardulli wenst u een vlot onderzoek.", prompt: "A friendly doctor smiling in a professional clinic setting, giving a thumbs up." }
    ],
    narrative: [
      "Medicatie. U moet stoppen met Aspirine of andere bloedplaatjesremmers zoals Adiro, Iscover, Disgren, Tiklid of Plavix tussen 3 en 8 dagen voor het onderzoek. Raadpleeg uw arts bij twijfel. Als u Sintrom of een ander antistollingsmiddel zoals Xarelto of Pradaxa gebruikt, moet u uw arts raadplegen om te beoordelen of het moet worden gestopt of vervangen. Bij hartaandoeningen, breng uw elektrocardiogram, echocardiogram en de instructies van uw cardioloog mee. Meld het als antibioticaprofylaxe vereist is. Oraal ijzer moet 7 dagen voor de coloscopie worden gestopt. Het is niet nodig om andere medicijnen te stoppen, u kunt ze tot 12 uur voor de test innemen.",
      "Welkom. Uw voorbereiding begint op [DATE1]. Hier is het visuele overzicht van alle fasen.",
      "Dag één en twee, op [DATE1] en [DATE2]. Strikt vezelarm dieet. U mag pasta, rijst, eieren, vlees en vis eten. Verboden om fruit, groenten of salades te eten.",
      "Dag drie, op [DATE3]. Uitsluitend vloeibaar dieet. Gezeefde bouillons, thee en water. Kippenbouillon aanbevolen. Vermijd rode vloeistoffen.",
      "Het door uw arts geselecteerde product voor darmreiniging is PLEINVUE. De doos bevat één groot zakje (eerste deel) en twee kleine zakjes A en B (tweede deel).",
      "Eerste dosis op [DATE_D1] om [TIME_D1]. Los het grote zakje op in een halve liter water. Drink in twee glazen met 15 minuten tussentijd.",
      "Hydratatie. Het is verplicht om nog twee glazen (ongeveer een halve liter) helder water te drinken na de eerste dosis.",
      "Tweede dosis op [DATE_D2] om [TIME_D2]. Meng de zakjes A en B in een halve liter water. Gebruik de slokjestechniek: kleine slok, gevolgd door water. Wacht tien tot vijftien minuten tussen de slokjes.",
      "Opgelet. Volledige stop om [TIME_STOP] op [DATE_STOP]. Stop volledig met drinken voor de anesthesie.",
      "Belangrijk. Drink geen alcohol, melk of iets roods of paars, zoals bessensap, of andere dranken die vruchtvlees bevatten. Eet niet tijdens het innemen van Pleinvue en tot na de klinische procedure. U mag op de dag van de coloscopie niet autorijden of gevaarlijke machines bedienen. Vergeet niet de ondertekende toestemmingsformulieren voor coloscopie en sedatie mee te brengen. Kom onder begeleiding naar het onderzoek met iemand die kan rijden of u kan helpen bij uw terugkeer naar huis. Er is een mogelijkheid dat u bij therapeutische ingrepen, zoals het verwijderen van poliepen, uw afspraken de volgende dag moet annuleren, of dat u 24 uur ter observatie moet blijven, hoewel deze situatie zelden nodig is.",
      "We zijn klaar. Dr. Nardulli en zijn team wensen u veel succes. Hou vol!"
    ]
  },
  fi: {
    welcome: "Hei. Olen virtuaalinen avustajasi. Luodaksesi henkilökohtaisen valmistelusuunnitelmasi, syötä tapaamisesi päivämäärä ja aika.",
    dateLabel: "Tapaamispäivä",
    timeLabel: "Tapaamisaika",
    calcBtn: "Luo suunnitelma",
    planTitle: "Valmistelusi",
    repeatBtn: "Toista",
    next: "Seuraava",
    prev: "Edellinen",
    startAssistant: "KÄYNNISTÄ AVUSTAJA",
    doctorTitle: "Gastroenterologi",
    screens: [
      { title: "Lääkitys", description: "• Keskeytä Aspiriinin tai muiden verihiutaleiden estäjien, kuten Adiro®, Iscover®, Disgren®, Tiklid®, Plavix®, käyttö 3–8 päivää ennen tutkimusta – kysy lääkäriltäsi, jos olet epävarma.\n• Jos käytät Sintrom®-valmistetta tai muuta antikoagulanttia (Xarelto®, Pradaxa®...), sinun on neuvoteltava lääkärisi kanssa sen keskeyttämisestä tai korvaamisesta.\n• Sydänsairauksissa: Ota mukaan sydänsähkökäyrä, sydämen ultraäänitutkimus ja kardiologin ohjeet. ILMOITA, JOS ANTIBIOOTTIPROFYLAKSIA VAADITAAN.\n• Suun kautta otettava rauta, keskeytä 7 päivää ennen kolonoskopiaa.\n• Muiden lääkkeiden keskeyttäminen EI ole tarpeen – ota jopa 12 tuntia ennen testiä.", prompt: "A medical infographic showing medication instructions." },
      { title: "Aikataulusi", description: "Alkaa [DATE1]. Seuraa tätä visuaalista yhteenvetoa.", prompt: "A medical infographic showing a timeline for colonoscopy preparation with icons for diet and hydration." },
      { title: "Päivät 1 ja 2", description: "[DATE1] ja [DATE2]. SALLITTU: Vähärasvainen liha, riisi, kananmunat. KIELLETTY: Hedelmät ja vihannekset.", prompt: "A healthy meal plate with white rice, a boiled egg, and grilled chicken breast. No vegetables or fruits." },
      { title: "Päivä 3", description: "Päivä [DATE3]. Nestemäinen ruokavalio. Siivilöity kanaliemi suositeltavaa.", prompt: "A clear bowl of golden chicken broth and a glass of water on a clean table." },
      { title: "Pleinvue-pakkaus", description: "PLEINVUE: Yksi suuri pussi (Osa 1) ja kaksi pientä A ja B (Osa 2).", prompt: "A professional medical box of Pleinvue laxative with sachets labeled Part 1 and Part 2." },
      { title: "Annos 1", description: "[DATE_D1] klo [TIME_D1]. Liuota puoleen litraan vettä. Juo kahdessa lasissa 15 minuutin tauolla.", prompt: "A person's hand pouring a white powder from a sachet into a glass of water." },
      { title: "Nesteytys", description: "Pakollista juoda kaksi ylimääräistä lasillista (puoli litraa) kirkasta vettä.", prompt: "Two clean glasses filled with sparkling clear water on a blue background." },
      { title: "Annos 2", description: "[DATE_D2] klo [TIME_D2]. Sekoita A+B puoleen litraan. Siemaustekniikka. Tauko 10-15 min.", prompt: "Two small sachets being mixed into a large glass of water." },
      { title: "VESI SEIS", description: "Alkaen [TIME_STOP] [DATE_STOP]. ÄLÄ JUO MITÄÄN.", prompt: "A minimalist red warning sign with a water drop icon crossed out." },
      { title: "Tärkeää", description: "• Älä juo alkoholia, maitoa tai mitään punaista tai violettia (esim. marjamehua) tai muita hedelmälihaa sisältäviä juomia.\n• Älä syö Pleinvue®-valmisteen ottamisen aikana ja ennen kuin kliinisen toimenpiteen jälkeen.\n• Et voi ajaa autoa kolonoskopiaklinikkapäivänä tai käyttää vaarallisia koneita.\n• TUO MUKANASI ALLEKIRJOITETUT SUOSTUMUKSET KOLONOSKOPIAAN JA RAUHOITUKSEEN.\n• Tule tutkimukseen saattajan kanssa, joka voi ajaa tai auttaa sinua kotimatkalla.\n• On mahdollista, että terapeuttisten toimenpiteiden, kuten polyyppien poiston, yhteydessä joudut perumaan seuraavan päivän menosi, tai saatat joutua jäämään tarkkailuun 24 tunniksi (tämä tilanne on harvoin tarpeen).", prompt: "A medical infographic showing important instructions." },
      { title: "Onnea", description: "Dr. Nardulli toivottaa sinulle sujuvaa toimenpidettä.", prompt: "A friendly doctor smiling in a professional clinic setting, giving a thumbs up." }
    ],
    narrative: [
      "Lääkitys. Sinun on keskeytettävä Aspiriinin tai muiden verihiutaleiden estäjien, kuten Adiron, Iscoverin, Disgrenin, Tiklidin tai Plavixin, käyttö 3–8 päivää ennen tutkimusta. Kysy lääkäriltäsi, jos olet epävarma. Jos käytät Sintromia tai muuta antikoagulanttia, kuten Xareltoa tai Pradaxaa, sinun on neuvoteltava lääkärisi kanssa sen keskeyttämisestä tai korvaamisesta. Sydänsairauksissa ota mukaan sydänsähkökäyrä, sydämen ultraäänitutkimus ja kardiologin ohjeet. Ilmoita, jos antibioottiprofylaksia vaaditaan. Suun kautta otettava rauta on keskeytettävä 7 päivää ennen kolonoskopiaa. Muiden lääkkeiden keskeyttäminen ei ole tarpeen, voit ottaa niitä jopa 12 tuntia ennen testiä.",
      "Tervetuloa. Valmistelusi alkaa [DATE1]. Tässä on visuaalinen yhteenveto kaikista vaiheista.",
      "Päivät yksi ja kaksi, [DATE1] ja [DATE2]. Tiukka kuiduton ruokavalio. Voit syödä pastaa, riisiä, kananmunia, lihaa ja kalaa. Hedelmät, vihannekset ja salaatit on kielletty.",
      "Päivä kolme, [DATE3]. Yksinomaan nestemäinen ruokavalio. Siivilöidyt liemet, tee ja vesi. Kanaliemi on suositeltavaa. Vältä punaisia nesteitä.",
      "Lääkärisi valitsema tuote on PLEINVUE. Sen pakkauksessa on yksi suuri pussi ensimmäistä osaa varten ja kaksi pientä pussia A ja B toista osaa varten.",
      "Ensimmäinen annos [DATE_D1] klo [TIME_D1]. Liuota suuri pussi puoleen litraan vettä. Juo kahdessa lasissa 15 minuutin välein.",
      "Nesteytys. On pakollista juoda vielä kaksi lasillista, noin puoli litraa, kirkasta vettä ensimmäisen annoksen jälkeen.",
      "Toinen annos [DATE_D2] klo [TIME_D2]. Sekoita pussit A ja B laimennettuna puoleen litraan vettä. Käytä siemaustekniikkaa: pieni siemaus, jota seuraa vesi. Odota kymmenestä viiteentoista minuuttia siemausten välillä.",
      "Huomio. Täysi pysähdys klo [TIME_STOP] [DATE_STOP]. Lopeta juominen kokonaan anestesiaa varten.",
      "Tärkeää. Älä juo alkoholia, maitoa tai mitään punaista tai violettia, kuten marjamehua, tai muita hedelmälihaa sisältäviä juomia. Älä syö Pleinvue-valmisteen ottamisen aikana ja ennen kuin kliinisen toimenpiteen jälkeen. Et voi ajaa autoa kolonoskopiaklinikkapäivänä tai käyttää vaarallisia koneita. Muista tuoda mukanasi allekirjoitetut suostumukset kolonoskopiaan ja rauhoitukseen. Tule tutkimukseen saattajan kanssa, joka voi ajaa tai auttaa sinua kotimatkalla. On mahdollista, että terapeuttisten toimenpiteiden, kuten polyyppien poiston, yhteydessä joudut perumaan seuraavan päivän menosi, tai saatat joutua jäämään tarkkailuun 24 tunniksi, vaikka tämä tilanne on harvoin tarpeen.",
      "Olemme valmiita. Dr. Nardulli ja hänen tiiminsä toivottavat sinulle onnea. Tsemppiä!"
    ]
  },
  nl: {
    welcome: "Hallo. Ik ben uw virtuele assistent. Om uw persoonlijke voorbereidingsplan te genereren, voert u de datum en tijd van uw afspraak in.",
    dateLabel: "Afspraakdatum",
    timeLabel: "Afspraaktijd",
    calcBtn: "Plan genereren",
    planTitle: "Uw voorbereiding",
    repeatBtn: "Herhalen",
    next: "Volgende",
    prev: "Vorige",
    startAssistant: "START ASSISTENT",
    doctorTitle: "Gastro-enteroloog",
    screens: [
      { title: "Medicatie", description: "• Stop met Aspirine of andere bloedplaatjesremmers zoals Adiro®, Iscover®, Disgren®, Tiklid®, Plavix® tussen 3 en 8 dagen voor het onderzoek – raadpleeg uw arts bij twijfel.\n• Als u Sintrom® of een ander antistollingsmiddel (Xarelto®, Pradaxa®...) gebruikt, moet u uw arts raadplegen om te beoordelen of het moet worden gestopt of vervangen.\n• Bij hartaandoeningen: Breng uw elektrocardiogram, echocardiogram en de instructies van uw cardioloog mee. MELD HET ALS ANTIBIOTICAPROFYLAXE VEREIST IS.\n• Oraal ijzer, stop 7 dagen voor de coloscopie.\n• Het is NIET nodig om andere medicijnen te stoppen – neem tot 12 uur voor de test in.", prompt: "A medical infographic showing medication instructions." },
      { title: "Uw tijdlijn", description: "Start op [DATE1]. Volg dit visuele overzicht.", prompt: "A medical infographic showing a timeline for colonoscopy preparation with icons for diet and hydration." },
      { title: "Dag 1 en 2", description: "[DATE1] en [DATE2]. TOEGESTAAN: Mager vlees, rijst, eieren. VERBODEN: Fruit en groenten.", prompt: "A healthy meal plate with white rice, a boiled egg, and grilled chicken breast. No vegetables or fruits." },
      { title: "Dag 3", description: "Dag [DATE3]. Vloeibaar dieet. Gezeefde kippenbouillon aanbevolen.", prompt: "A clear bowl of golden chicken bouillon and a glass of water on a clean table." },
      { title: "Pleinvue-kit", description: "PLEINVUE: Eén groot zakje (Deel 1) en twee kleine zakjes A en B (Deel 2).", prompt: "A professional medical box of Pleinvue laxative with sachets labeled Part 1 and Part 2." },
      { title: "Dosis 1", description: "Op [DATE_D1] om [TIME_D1]. Oplossen in een halve liter water. Drink in twee glazen met 15 min pauze.", prompt: "A person's hand pouring a white powder from a sachet into a glass of water." },
      { title: "Hydratatie", description: "Verplicht om nog twee extra glazen (een halve liter) helder water te drinken.", prompt: "Two clean glasses filled with sparkling clear water on a blue background." },
      { title: "Dosis 2", description: "Op [DATE_D2] om [TIME_D2]. Meng A+B in een halve liter. Slokjestechniek. Pauze 10-15 min.", prompt: "Two small sachets being mixed into a large glass of water." },
      { title: "STOP WATER", description: "Vanaf [TIME_STOP] op [DATE_STOP]. NIETS DRINKEN.", prompt: "A minimalist red warning sign with a water drop icon crossed out." },
      { title: "Belangrijk", description: "• Drink geen alcohol, melk of iets roods of paars (bijv. bessensap) of andere dranken die vruchtvlees bevatten.\n• Eet niet tijdens het innemen van Pleinvue® en tot na de klinische procedure.\n• U mag op de dag van de coloscopie niet autorijden of gevaarlijke machines bedienen.\n• BRENG DE ONDERTEKENDE TOESTEMMINGSFORMULIEREN VOOR COLOSCOPIE EN SEDATIE MEE.\n• Kom onder begeleiding naar het onderzoek met iemand die kan rijden of u kan helpen bij uw terugkeer naar huis.\n• Er is een mogelijkheid dat u bij therapeutische ingrepen, zoals het verwijderen van poliepen, uw afspraken de volgende dag moet annuleren, of dat u 24 uur ter observatie moet blijven (deze situatie is zelden nodig).", prompt: "A medical infographic showing important instructions." },
      { title: "Veel succes", description: "Dr. Nardulli wenst u een vlot onderzoek.", prompt: "A friendly doctor smiling in a professional clinic setting, giving a thumbs up." }
    ],
    narrative: [
      "Medicatie. U moet stoppen met Aspirine of andere bloedplaatjesremmers zoals Adiro, Iscover, Disgren, Tiklid of Plavix tussen 3 en 8 dagen voor het onderzoek. Raadpleeg uw arts bij twijfel. Als u Sintrom of een ander antistollingsmiddel zoals Xarelto of Pradaxa gebruikt, moet u uw arts raadplegen om te beoordelen of het moet worden gestopt of vervangen. Bij hartaandoeningen, breng uw elektrocardiogram, echocardiogram en de instructies van uw cardioloog mee. Meld het als antibioticaprofylaxe vereist is. Oraal ijzer moet 7 dagen voor de coloscopie worden gestopt. Het is niet nodig om andere medicijnen te stoppen, u kunt ze tot 12 uur voor de test innemen.",
      "Welkom. Uw voorbereiding begint op [DATE1]. Hier is het visuele overzicht van alle fasen.",
      "Dag één en twee, op [DATE1] en [DATE2]. Strikt vezelarm dieet. U mag pasta, rijst, eieren, vlees en vis eten. Verboden om fruit, groenten of salades te eten.",
      "Dag drie, op [DATE3]. Uitsluitend vloeibaar dieet. Gezeefde bouillons, thee en water. Kippenbouillon aanbevolen. Vermijd rode vloeistoffen.",
      "Het door uw arts geselecteerde product voor darmreiniging is PLEINVUE. De doos bevat één groot zakje (eerste deel) en twee kleine zakjes A en B (tweede deel).",
      "Eerste dosis op [DATE_D1] om [TIME_D1]. Los het grote zakje op in een halve liter water. Drink in twee glazen met 15 minuten tussentijd.",
      "Hydratatie. Het is verplicht om nog twee glazen (ongeveer een halve liter) helder water te drinken na de eerste dosis.",
      "Tweede dosis op [DATE_D2] om [TIME_D2]. Meng de zakjes A en B in een halve liter water. Gebruik de slokjestechniek: kleine slok, gevolgd door water. Wacht tien tot vijftien minuten tussen de slokjes.",
      "Let op. Volledige stop om [TIME_STOP] op [DATE_STOP]. Stop volledig met drinken voor de anesthesie.",
      "Belangrijk. Drink geen alcohol, melk of iets roods of paars, zoals bessensap, of andere dranken die vruchtvlees bevatten. Eet niet tijdens het innemen van Pleinvue en tot na de klinische procedure. U mag op de dag van de coloscopie niet autorijden of gevaarlijke machines bedienen. Vergeet niet de ondertekende toestemmingsformulieren voor coloscopie en sedatie mee te brengen. Kom onder begeleiding naar het onderzoek met iemand die kan rijden of u kan helpen bij uw terugkeer naar huis. Er is een mogelijkheid dat u bij therapeutische ingrepen, zoals het verwijderen van poliepen, uw afspraken de volgende dag moet annuleren, of dat u 24 uur ter observatie moet blijven, hoewel deze situatie zelden nodig is.",
      "We zijn klaar. Dr. Nardulli en zijn team wensen u veel succes. Zet hem op!"
    ]
  }
};

// --- Helper Functions ---

const getCalculatedDates = (dateStr: string, timeStr: string, lang: Language) => {
  if (!dateStr || !timeStr) return null;
  const apptDate = new Date(`${dateStr}T${timeStr}`);
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
  
  const dMin3 = new Date(apptDate); dMin3.setDate(apptDate.getDate() - 3);
  const dMin2 = new Date(apptDate); dMin2.setDate(apptDate.getDate() - 2);
  const dMin1 = new Date(apptDate); dMin1.setDate(apptDate.getDate() - 1);
  
  const hour = apptDate.getHours();
  let d1Date = new Date();
  let d2Date = new Date();
  
  if (hour < 11) {
    d1Date = new Date(dMin1); d1Date.setHours(21, 0);
    d2Date = new Date(dMin1); d2Date.setHours(22, 0);
  } else if (hour < 15) {
    d1Date = new Date(dMin1); d1Date.setHours(21, 0);
    d2Date = new Date(apptDate); d2Date.setHours(5, 0);
  } else {
    d1Date = new Date(apptDate); d1Date.setHours(6, 0);
    d2Date = new Date(apptDate); d2Date.setHours(9, 0);
  }
  
  const stopDate = new Date(apptDate);
  stopDate.setHours(apptDate.getHours() - 4);
  
  const locale = LANG_CONFIG[lang]?.voice || 'es-ES';

  const fmt = (d: Date) => d.toLocaleDateString(locale, options);
  const tm = (d: Date) => d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });
  
  return {
    dietStart: fmt(dMin3),
    dietMid: fmt(dMin2),
    dietLiquid: fmt(dMin1),
    dose1: { time: tm(d1Date), date: fmt(d1Date) },
    dose2: { time: tm(d2Date), date: fmt(d2Date) },
    stop: { time: tm(stopDate), date: fmt(stopDate) }
  };
};

// --- Components ---

const Navbar = ({ onReset, lang, isDarkMode, toggleDarkMode }: { onReset: () => void, lang: Language, isDarkMode: boolean, toggleDarkMode: () => void }) => (
  <nav className={`${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'} backdrop-blur-md fixed w-full z-50 border-b shadow-sm transition-colors duration-300`}>
    <div className="container mx-auto px-4 py-3 flex justify-between items-center">
      <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
        <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-lg">
          <Stethoscope size={20} />
        </div>
        <div>
          <h1 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'} leading-none`}>Dr. Nardulli</h1>
          <span className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-widest font-semibold`}>{TRANSLATIONS[lang].doctorTitle}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleDarkMode}
          className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="hidden md:flex gap-6 text-[10px] font-bold uppercase tracking-widest">
          <button onClick={onReset} className={`${isDarkMode ? 'text-slate-300 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600'} transition-colors`}>Inicio</button>
        </div>
      </div>
    </div>
  </nav>
);

const STATIC_IMAGES: Record<number, string> = {
  1: '/Infografia-general-preparacion.png',
  2: '/Dieta-sin-fibra-2.png',
  3: '/Dieta liquidos.png',
  4: '/Caja-de-Pleinvue.png',
  5: '/Pleinvue-1ra-dosis.png',
  6: '/Infografia-general-preparacion.png',
  7: '/Pleinvue-2da-dosis.png',
  8: '/Infografia-general-preparacion.png',
  9: '/Infografia-general-preparacion.png',
  10: '/dr-nardulli.png'
};

export default function App() {
  const [lang, setLang] = useState<Language>('es');
  const [view, setView] = useState<'landing' | 'select' | 'input' | 'guide'>('landing');
  const [apptData, setApptData] = useState({ date: '', time: '' });
  const [calcDates, setCalcDates] = useState<any>(null);
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isAutoRun, setIsAutoRun] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const isPlayingRef = useRef(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const t = TRANSLATIONS[lang];

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const resetAssistant = () => {
    stopPlayback();
    setView('landing');
    setApptData({ date: '', time: '' });
    setCalcDates(null);
    setStep(0);
  };

  const handleLangSelect = (key: Language) => {
    setLang(key);
    setView('input');
    window.speechSynthesis.cancel();
  };

  const calculateScenario = () => {
    if (!apptData.time || !apptData.date) return;
    const res = getCalculatedDates(apptData.date, apptData.time, lang);
    setCalcDates(res);
    setView('guide');
    setStep(0);
    startPlayback();
  };

  const startPlayback = () => {
    setIsPlaying(true);
    isPlayingRef.current = true;
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
  };

  const getDynamicText = (raw: string) => {
    if (!calcDates || !raw) return raw;
    return raw
      .replace(/\[DATE1\]/g, calcDates.dietStart)
      .replace(/\[DATE2\]/g, calcDates.dietMid)
      .replace(/\[DATE3\]/g, calcDates.dietLiquid)
      .replace(/\[DATE_D1\]/g, calcDates.dose1.date)
      .replace(/\[TIME_D1\]/g, calcDates.dose1.time)
      .replace(/\[DATE_D2\]/g, calcDates.dose2.date)
      .replace(/\[TIME_D2\]/g, calcDates.dose2.time)
      .replace(/\[DATE_STOP\]/g, calcDates.stop.date)
      .replace(/\[TIME_STOP\]/g, calcDates.stop.time);
  };

  const speak = (text: string) => {
    if (isMuted || !window.speechSynthesis || !text) return;
    
    window.speechSynthesis.cancel();
    
    const finalString = getDynamicText(text);
    const u = new SpeechSynthesisUtterance(finalString);
    u.lang = LANG_CONFIG[lang].voice;
    u.rate = 0.95;
    
    u.onend = () => {
      if (isPlayingRef.current && isAutoRun && step < t.screens.length - 1) {
        // Auto advance after a short delay if playing and autorun is on
        setTimeout(() => {
          if (isPlayingRef.current) setStep(s => s + 1);
        }, 1500);
      } else if (step === t.screens.length - 1) {
        stopPlayback();
      }
    };

    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
  };

  // Effect for narration
  useEffect(() => {
    if (view === 'guide' && isPlaying) {
      const text = t.narrative[step];
      if (text) speak(text);
    } else if (view === 'input') {
      speak(t.welcome);
    }
  }, [step, view, isPlaying, lang]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsChatLoading(true);
    
    const response = await getChatResponse(userMessage, [], lang);
    setChatMessages(prev => [...prev, { role: 'model', text: response || '' }]);
    setIsChatLoading(false);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar onReset={resetAssistant} lang={lang} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      <main className="flex-grow pt-16 md:pt-20">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.section 
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="container mx-auto px-6 py-10 md:py-20 flex flex-col md:flex-row items-center gap-12"
            >
              <div className="md:w-1/2 space-y-6 md:space-y-8">
                <div className={`inline-flex items-center gap-2 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'} px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest`}>
                  <Sparkles size={12} /> Tecnología Médica
                </div>
                <h1 className={`text-4xl md:text-6xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} leading-tight tracking-tighter`}>
                  Cuidando su salud con <span className="text-blue-500">precisión</span>.
                </h1>
                <p className={`text-lg md:text-xl ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} leading-relaxed max-w-lg font-medium`}>
                  He diseñado este asistente para que su preparación sea clara, exacta y segura basándose en su cita.
                </p>
                <button 
                  onClick={() => setView('select')}
                  className="bg-blue-600 text-white px-8 py-4 md:px-10 md:py-5 rounded-2xl font-bold shadow-xl shadow-blue-900/20 hover:bg-blue-700 transition-all flex items-center gap-3 text-base md:text-lg uppercase tracking-widest"
                >
                  <Play size={18} fill="currentColor" /> {t.startAssistant}
                </button>
              </div>
              <div className="md:w-1/2 relative">
                <div className={`relative ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} p-4 rounded-[3rem] shadow-2xl border max-w-md mx-auto overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-700`}>
                  <img 
                    src="/dr-nardulli.png" 
                    alt="Dr. Nardulli" 
                    className="rounded-[2.5rem] w-full h-auto object-cover transition-all duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://picsum.photos/seed/dr-nardulli-gastro/800/1000?grayscale=${isDarkMode ? 1 : 0}`;
                    }}
                    referrerPolicy="no-referrer"
                  />
                  <div className={`absolute bottom-6 right-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-4 md:p-6 rounded-3xl shadow-2xl border flex items-center gap-4`}>
                    <div className="bg-green-500/10 p-2 md:p-3 rounded-2xl text-green-500">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <p className={`font-black text-sm md:text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Dr. Nardulli</p>
                      <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} uppercase font-bold tracking-widest`}>{t.doctorTitle}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {view === 'select' && (
            <motion.section 
              key="select"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="container mx-auto px-6 py-10 md:py-20 text-center"
            >
              <h2 className={`text-3xl md:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-4`}>Seleccione su idioma</h2>
              <p className={`${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mb-8 md:mb-12 text-base md:text-lg`}>El asistente le guiará en su lengua materna.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 max-w-5xl mx-auto">
                {Object.entries(LANG_CONFIG).map(([key, config]) => (
                  <button 
                    key={key} 
                    onClick={() => handleLangSelect(key as Language)}
                    className={`group p-6 md:p-8 ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-blue-500' : 'bg-white border-slate-200 hover:border-blue-500'} rounded-3xl border hover:shadow-2xl transition-all flex flex-col items-center gap-3 md:gap-4`}
                  >
                    <span className="text-4xl md:text-6xl group-hover:scale-110 transition-transform">{config.flag}</span>
                    <span className={`font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-700'} uppercase tracking-widest text-[10px]`}>{config.name}</span>
                  </button>
                ))}
              </div>
            </motion.section>
          )}

          {view === 'input' && (
            <motion.section 
              key="input"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="container mx-auto px-6 py-10 md:py-20"
            >
              <div className={`max-w-xl mx-auto ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} p-8 md:p-12 rounded-[3rem] shadow-2xl border`}>
                <div className="flex gap-4 md:gap-6 mb-8 md:mb-10 items-start">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xl">
                    <MessageCircle size={24} className="md:hidden" />
                    <MessageCircle size={32} className="hidden md:block" />
                  </div>
                  <div className={`${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-blue-50 text-slate-700 border-blue-100'} p-4 md:p-6 rounded-3xl rounded-tl-none text-base md:text-lg leading-relaxed border font-medium`}>
                    {t.welcome}
                  </div>
                </div>
                <div className="space-y-6 md:space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest flex items-center gap-2">
                      <CalendarIcon size={12} /> {t.dateLabel}
                    </label>
                    <input 
                      type="date" 
                      className={`w-full p-4 md:p-5 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'} rounded-2xl border outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-base md:text-lg`}
                      onChange={(e) => setApptData({...apptData, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest flex items-center gap-2">
                      <Clock size={12} /> {t.timeLabel}
                    </label>
                    <input 
                      type="time" 
                      className={`w-full p-4 md:p-5 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'} rounded-2xl border outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-base md:text-lg`}
                      onChange={(e) => setApptData({...apptData, time: e.target.value})}
                    />
                  </div>
                  <button 
                    onClick={calculateScenario}
                    disabled={!apptData.time || !apptData.date}
                    className="w-full bg-blue-600 text-white font-black py-5 md:py-6 rounded-2xl shadow-xl shadow-blue-900/20 hover:bg-blue-700 disabled:opacity-50 transition-all uppercase tracking-widest text-base md:text-lg flex items-center justify-center gap-3"
                  >
                    {t.calcBtn} <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </motion.section>
          )}

          {view === 'guide' && (
            <motion.section 
              key="guide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 pt-16 md:pt-20 bg-inherit z-40 overflow-hidden flex flex-col"
            >
              <div className="flex-grow flex flex-col container mx-auto px-4 py-4 md:py-6 max-w-4xl">
                <div className="flex justify-between items-center mb-4 shrink-0">
                  <h2 className={`text-lg md:text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} uppercase tracking-tighter`}>{t.planTitle}</h2>
                  <div className="flex items-center gap-3">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Paso {step + 1}/{t.screens.length}
                    </div>
                    <button 
                      onClick={resetAssistant}
                      className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'} px-3 py-1.5 rounded-full transition-all`}
                    >
                      Salir
                    </button>
                  </div>
                </div>

                <div className={`flex-grow flex flex-col ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden border relative`}>
                  <div className="h-1.5 w-full bg-slate-800/10 shrink-0">
                    <motion.div 
                      className="h-full bg-blue-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${((step + 1) / t.screens.length) * 100}%` }}
                    />
                  </div>

                  <div className="flex-grow flex flex-col p-6 md:p-10 overflow-hidden">
                    <div className="flex-grow flex flex-col items-center justify-center text-center space-y-4 md:space-y-6 overflow-y-auto no-scrollbar">
                      {STATIC_IMAGES[step] && (
                        <div className="w-full max-w-md aspect-video bg-slate-800/5 rounded-2xl md:rounded-[2rem] overflow-hidden relative border border-slate-800/5 shadow-inner shrink-0">
                          <motion.img 
                            key={step}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            src={STATIC_IMAGES[step]} 
                            alt={t.screens[step].title}
                            className="w-full h-full object-contain bg-white"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${step}/800/450?blur=2&grayscale=${isDarkMode ? 1 : 0}`;
                            }}
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      <div className="space-y-2 md:space-y-4 max-w-2xl">
                        <h3 className={`text-2xl md:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} uppercase tracking-tighter leading-none`}>
                          {t.screens[step].title}
                        </h3>
                        <div className={`text-sm md:text-xl ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} font-medium leading-relaxed whitespace-pre-wrap`}>
                          {getDynamicText(t.screens[step].description)}
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 shrink-0 flex flex-col gap-4">
                      <div className="flex flex-wrap justify-center items-center gap-3 md:gap-6">
                        <button 
                          onClick={() => setStep(s => Math.max(0, s - 1))}
                          disabled={step === 0}
                          className={`p-4 md:p-5 rounded-2xl ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} transition-all disabled:opacity-20`}
                        >
                          <ChevronLeft size={20} />
                        </button>
                        
                        <button 
                          onClick={() => isPlaying ? stopPlayback() : startPlayback()}
                          className="flex-grow md:flex-none px-8 md:px-12 py-4 md:py-5 rounded-2xl bg-blue-600 text-white font-black shadow-xl shadow-blue-900/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 text-sm md:text-lg tracking-widest uppercase"
                        >
                          {isPlaying ? <Pause size={20} fill="currentColor"/> : <Play size={20} fill="currentColor"/>}
                          <span className="hidden sm:inline">{isPlaying ? "Pausar" : "Continuar"}</span>
                        </button>

                        <button 
                          onClick={() => setStep(s => Math.min(t.screens.length - 1, s + 1))}
                          disabled={step === t.screens.length - 1}
                          className={`p-4 md:p-5 rounded-2xl ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} transition-all disabled:opacity-20`}
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>

                      <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Auto</span>
                          <button 
                            onClick={() => setIsAutoRun(!isAutoRun)}
                            className={`w-10 h-5 rounded-full transition-all relative ${isAutoRun ? 'bg-blue-600' : 'bg-slate-700'}`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${isAutoRun ? 'left-5.5' : 'left-0.5'}`} />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => setIsMuted(!isMuted)}
                            className={`p-2 rounded-xl transition-all ${isMuted ? 'text-red-500' : 'text-slate-500 hover:text-blue-500'}`}
                          >
                            {isMuted ? <VolumeX size={18}/> : <Volume2 size={18}/>}
                          </button>
                          
                          {step === t.screens.length - 1 && (
                            <button 
                              onClick={() => { setStep(0); startPlayback(); }}
                              className="flex items-center gap-2 text-blue-500 font-black uppercase tracking-widest text-[10px] hover:underline"
                            >
                              <RefreshCw size={14} /> {t.repeatBtn}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Chatbot UI */}
      <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[100]">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} w-[calc(100vw-2rem)] md:w-96 h-[450px] md:h-[500px] rounded-[2rem] shadow-2xl border flex flex-col overflow-hidden mb-4`}
            >
              <div className="bg-blue-600 p-5 md:p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <MessageCircle size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-xs md:text-sm">Asistente Dr. Nardulli</p>
                    <p className="text-[9px] opacity-80 uppercase tracking-widest font-bold">En línea</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-all">
                  <X size={18} />
                </button>
              </div>
              
              <div className={`flex-grow overflow-y-auto p-4 md:p-6 space-y-4 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
                {chatMessages.length === 0 && (
                  <div className="text-center py-8 md:py-10 space-y-4">
                    <div className={`w-12 h-12 md:w-16 md:h-16 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'} rounded-full flex items-center justify-center mx-auto`}>
                      <Sparkles size={24} className="md:hidden" />
                      <Sparkles size={32} className="hidden md:block" />
                    </div>
                    <p className={`${isDarkMode ? 'text-slate-500' : 'text-slate-500'} text-xs md:text-sm font-medium px-4`}>¿En qué puedo ayudarle hoy con su preparación?</p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 md:p-4 rounded-2xl text-xs md:text-sm font-medium ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : `${isDarkMode ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-white text-slate-700 border-slate-200'} border rounded-tl-none shadow-sm`
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} p-3 md:p-4 rounded-2xl rounded-tl-none border shadow-sm flex gap-1`}>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className={`p-3 md:p-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border-t flex gap-2`}>
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Escriba su pregunta..."
                  className={`flex-grow p-3 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'} rounded-xl border outline-none focus:border-blue-500 text-xs md:text-sm font-medium`}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || isChatLoading}
                  className="bg-blue-600 text-white p-3 rounded-xl shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`w-12 h-12 md:w-16 md:h-16 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
            isChatOpen ? 'bg-slate-800 text-white' : 'bg-blue-600 text-white'
          }`}
        >
          {isChatOpen ? <X size={24} /> : <MessageCircle size={24} className="md:hidden" />}
          {isChatOpen ? null : <MessageCircle size={32} className="hidden md:block" />}
        </button>
      </div>

      <footer className={`py-12 border-t transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-white border-slate-100'}`}>
        <div className="container mx-auto px-6 flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 text-blue-600">
            <Stethoscope size={20} />
            <span className={`font-black text-xl tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>EndoscopiaNardulli</span>
          </div>
          <p className={`text-[10px] font-bold uppercase tracking-[0.3em] text-center ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            © {new Date().getFullYear()} Dr. Gianfranco Nardulli Fernández. <br className="md:hidden" /> Especialista en Aparato Digestivo.
          </p>
        </div>
      </footer>
    </div>
  );
}
