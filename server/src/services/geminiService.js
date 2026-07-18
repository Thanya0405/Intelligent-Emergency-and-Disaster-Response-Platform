const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;

const initGemini = () => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.warn('⚠️  GEMINI_API_KEY not set — AI features will use mock responses');
    return false;
  }
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use a multimodal-capable model. gemini-2.0-flash (and 1.5-flash) support
    // both text and image input. Override via GEMINI_MODEL if needed.
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    model = genAI.getGenerativeModel({ model: modelName });
    console.log(`✅ Gemini AI initialized (model: ${modelName})`);
    return true;
  } catch (e) {
    console.error('❌ Gemini init failed:', e.message);
    return false;
  }
};

const isAvailable = initGemini();

const safeJsonParse = (text, fallback) => {
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    console.warn('Gemini JSON parse failed, using fallback');
    return fallback;
  }
};

const generateContent = async (prompt, image) => {
  if (!isAvailable || !model) throw new Error('AI_UNAVAILABLE');

  // If an image is supplied, send it as a proper multimodal part.
  // `image` must be { data: <base64 string>, mimeType: 'image/png' | 'image/jpeg' | ... }
  if (image && image.data) {
    const mimeType = image.mimeType || 'image/png';
    // Validate we are using a vision-capable model before sending image data.
    const visionModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-2.0-pro', 'gemini-2.5-flash', 'gemini-2.5-pro'];
    const currentModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    if (!visionModels.some(m => currentModel.startsWith(m.split('-').slice(0, 2).join('-')))) {
      throw new Error('IMAGE_NOT_SUPPORTED: the configured Gemini model does not support image input. Use a vision-capable model (e.g. gemini-2.0-flash).');
    }
    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { data: image.data, mimeType } }
    ]);
    return result.response.text();
  }

  const result = await model.generateContent(prompt);
  return result.response.text();
};

// 1. Accident Severity Analysis
const analyzeAccidentSeverity = async (sensorData) => {
  const fallback = {
    severityLevel: 'medium',
    severityScore: 5.5,
    confidence: 0.6,
    recommendedAction: 'Call emergency services immediately. Check for consciousness and breathing. Do not move the victim unless necessary.',
    riskFactors: ['Unable to fully assess without AI', 'Treat as serious until evaluated'],
    estimatedResponseTime: '8-12 minutes'
  };

  try {
    const prompt = `You are an emergency response AI. Analyze this accident sensor data and respond with ONLY valid JSON.

Sensor Data: ${JSON.stringify(sensorData)}

Respond with ONLY this JSON structure (no markdown, no explanation):
{
  "severityLevel": "low|medium|high|critical",
  "severityScore": <number 1-10>,
  "confidence": <number 0-1>,
  "recommendedAction": "<immediate action string>",
  "riskFactors": ["<risk1>", "<risk2>"],
  "estimatedResponseTime": "<time string>"
}`;

    const text = await generateContent(prompt);
    return safeJsonParse(text, fallback);
  } catch (e) {
    if (e.message === 'AI_UNAVAILABLE') return fallback;
    throw e;
  }
};

// 2. Disaster Risk Analysis
const analyzeDisasterRisk = async (regionData) => {
  const fallback = {
    riskLevel: 'medium',
    riskScore: 5,
    primaryThreats: ['Monitor local weather alerts', 'Stay informed via official channels'],
    guidance: 'Stay alert and follow local authority instructions. Prepare an emergency kit with water, food, and first aid supplies.',
    evacuationRecommended: false,
    safeZones: ['Local community centers', 'High-ground areas', 'Government shelters']
  };

  try {
    const prompt = `You are a disaster risk assessment AI. Analyze this regional data and respond with ONLY valid JSON.

Region Data: ${JSON.stringify(regionData)}

Respond with ONLY this JSON structure:
{
  "riskLevel": "low|medium|high|critical",
  "riskScore": <number 1-10>,
  "primaryThreats": ["<threat1>", "<threat2>"],
  "guidance": "<plain language safety guidance>",
  "evacuationRecommended": <boolean>,
  "safeZones": ["<zone1>", "<zone2>"]
}`;

    const text = await generateContent(prompt);
    return safeJsonParse(text, fallback);
  } catch (e) {
    if (e.message === 'AI_UNAVAILABLE') return fallback;
    throw e;
  }
};

// 3. First Aid Assistant (conversational)
const firstAidChat = async (userMessage, conversationHistory = [], image = null) => {
  const fallback = {
    response: `For any medical emergency, please call 108 (India) or your local emergency number immediately.

Here are general first aid steps:
1. Ensure the scene is safe before approaching
2. Check for consciousness and breathing
3. Call emergency services (108/112)
4. Do not move the victim unless in immediate danger
5. Provide CPR if trained and if victim is unresponsive and not breathing

⚠️ DISCLAIMER: This AI is for informational purposes only. Always contact certified emergency services (108/112) for life-threatening situations.`,
    disclaimer: true
  };

  try {
    const historyContext = conversationHistory
      .slice(-6)
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    const prompt = `You are SafeGuard AI's First Aid Assistant. You provide clear, calm, step-by-step first aid guidance.

RULES:
- Always include a disclaimer to call 108/112 emergency services for serious conditions
- Give numbered, actionable steps
- Be concise and clear
- Never claim to replace professional medical advice
- If situation is life-threatening, prioritize "Call 108/112 IMMEDIATELY" as step 1

Previous conversation:
${historyContext}

User asks: ${userMessage}

Respond naturally and helpfully with first aid guidance.`;

    const text = await generateContent(prompt, image);
    return {
      response: text + '\n\n⚠️ DISCLAIMER: Always call 108/112 for emergencies. This AI provides guidance only, not medical advice.',
      disclaimer: true
    };
  } catch (e) {
    if (e.message === 'AI_UNAVAILABLE') return fallback;
    throw e;
  }
};

// 4. Hospital Recommendation
const recommendHospital = async (condition, hospitals) => {
  const fallback = {
    rankedHospitals: hospitals.slice(0, 3).map((h, i) => ({
      hospitalId: h._id,
      name: h.name,
      rank: i + 1,
      reasoning: `Nearest available hospital with emergency capabilities`,
      suitabilityScore: 8 - i
    })),
    recommendation: 'Proceed to the nearest hospital with emergency services immediately.',
    transportAdvice: 'Call 108 for ambulance or use the fastest available transport.'
  };

  try {
    const hospitalList = hospitals.map(h => ({
      id: h._id,
      name: h.name,
      specialties: h.specialties,
      distance: h.distance,
      availableBeds: h.availableBeds
    }));

    const prompt = `You are a medical triage AI. Recommend the best hospital for this patient. Respond with ONLY valid JSON.

Patient Condition: ${condition}
Nearby Hospitals: ${JSON.stringify(hospitalList)}

Respond with ONLY this JSON:
{
  "rankedHospitals": [
    {"hospitalId": "<id>", "name": "<name>", "rank": 1, "reasoning": "<why>", "suitabilityScore": <1-10>}
  ],
  "recommendation": "<overall recommendation>",
  "transportAdvice": "<how to get there>"
}`;

    const text = await generateContent(prompt);
    return safeJsonParse(text, fallback);
  } catch (e) {
    if (e.message === 'AI_UNAVAILABLE') return fallback;
    throw e;
  }
};

// 5. Safety Recommendations
const generateSafetyRecommendations = async (alerts, userProfile) => {
  const fallback = {
    immediateActions: [
      'Stay indoors and monitor official news channels',
      'Ensure emergency supplies are accessible',
      'Keep phone charged and emergency contacts ready'
    ],
    preparednessSteps: [
      'Prepare go-bag with essentials (water, food, documents, medicines)',
      'Identify nearest shelter and evacuation routes',
      'Inform family members of your location'
    ],
    riskAssessment: 'moderate',
    personalizedAdvice: 'Based on active alerts in your area, remain vigilant and follow official guidance.'
  };

  try {
    const prompt = `You are a personal safety AI. Generate contextual safety recommendations. Respond with ONLY valid JSON.

Active Alerts: ${JSON.stringify(alerts.map(a => ({ type: a.type, severity: a.severity, region: a.region })))}
User Profile: Age ${userProfile.age || 'unknown'}, Medical: ${userProfile.medicalConditions?.join(', ') || 'none'}

Respond with ONLY this JSON:
{
  "immediateActions": ["<action1>", "<action2>", "<action3>"],
  "preparednessSteps": ["<step1>", "<step2>", "<step3>"],
  "riskAssessment": "low|moderate|high|critical",
  "personalizedAdvice": "<personalized safety tip>"
}`;

    const text = await generateContent(prompt);
    return safeJsonParse(text, fallback);
  } catch (e) {
    if (e.message === 'AI_UNAVAILABLE') return fallback;
    throw e;
  }
};

// 6. Emergency Report Generation
const generateEmergencyReport = async (emergencyData) => {
  const fallback = {
    executiveSummary: `Emergency incident of type ${emergencyData.type} reported at ${new Date().toISOString()}`,
    incidentAnalysis: 'Incident occurred and emergency services were notified. Situation under monitoring.',
    responseTimeline: emergencyData.timeline || [],
    recommendedActions: [
      'Continue monitoring affected area',
      'Ensure all responders have debriefed',
      'Document all actions taken',
      'File official incident report with authorities'
    ],
    preventionMeasures: [
      'Regular safety drills and training',
      'Maintain updated emergency contact lists',
      'Install early warning systems'
    ],
    severity: emergencyData.severity || 'medium',
    conclusionNotes: 'Incident response completed. Review protocols for future improvement.'
  };

  try {
    const prompt = `You are an emergency incident report writer. Generate a professional incident report. Respond with ONLY valid JSON.

Emergency Data: ${JSON.stringify(emergencyData)}

Respond with ONLY this JSON:
{
  "executiveSummary": "<2-3 sentence summary>",
  "incidentAnalysis": "<detailed analysis paragraph>",
  "responseTimeline": ["<event1>", "<event2>"],
  "recommendedActions": ["<action1>", "<action2>", "<action3>"],
  "preventionMeasures": ["<measure1>", "<measure2>"],
  "severity": "low|medium|high|critical",
  "conclusionNotes": "<closing remarks>"
}`;

    const text = await generateContent(prompt);
    return safeJsonParse(text, fallback);
  } catch (e) {
    if (e.message === 'AI_UNAVAILABLE') return fallback;
    throw e;
  }
};

module.exports = {
  analyzeAccidentSeverity,
  analyzeDisasterRisk,
  firstAidChat,
  recommendHospital,
  generateSafetyRecommendations,
  generateEmergencyReport
};
