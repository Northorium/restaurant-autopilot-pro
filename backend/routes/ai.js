const express = require('express');
const router = express.Router();

// AI-generated responses (demo mode - in production use OpenAI API)
const generateResponse = (rating, text, businessName = 'Bella Napoli') => {
  // Simple rule-based responses for demo
  if (rating >= 4) {
    const positiveTemplates = [
      `Thank you so much for your wonderful review! We're thrilled you enjoyed your experience at ${businessName}. We look forward to welcoming you back soon! 🍝`,
      `Grazie mille for the kind words! We're so happy you had a great time. Can't wait to see you again! ❤️`,
      `We're delighted to hear you loved your visit! Thank you for choosing ${businessName}. See you soon! ✨`,
      `Your review made our day! We're so glad you enjoyed everything. Looking forward to your next visit! 🌟`
    ];
    return positiveTemplates[Math.floor(Math.random() * positiveTemplates.length)];
  } else if (rating === 3) {
    return `Thank you for your feedback! We appreciate you taking the time to share your experience. We're always working to improve, and your comments help us do that. We hope to have the opportunity to serve you again and exceed your expectations. 🙏`;
  } else {
    return `Thank you for your honest feedback. We're sorry your experience didn't meet expectations. We take all reviews seriously and would love the opportunity to make things right. Please reach out to us directly so we can address your concerns. We hope to welcome you back soon. 💙`;
  }
};

// Generate AI response for review
router.post('/generate-response', async (req, res) => {
  try {
    const { rating, text, authorName, platform } = req.body;
    
    if (!rating || !text) {
      return res.status(400).json({ error: 'Rating and text are required' });
    }
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const response = generateResponse(rating, text);
    
    res.json({
      response,
      confidence: 0.95,
      sentiment: rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative',
      suggestions: [
        response,
        generateResponse(rating, text),  // Alternative 1
        generateResponse(rating, text)   // Alternative 2
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get AI response suggestions
router.get('/suggestions', (req, res) => {
  res.json({
    templates: {
      positive: [
        "Thank you for the wonderful review! We're so glad you enjoyed...",
        "Grazie mille! Your kind words mean the world to us...",
        "We're thrilled you had a great experience! Can't wait to see you again..."
      ],
      neutral: [
        "Thank you for your feedback. We appreciate your honest review...",
        "We value your input and are always working to improve..."
      ],
      negative: [
        "We're sorry to hear about your experience. Please contact us directly...",
        "Thank you for bringing this to our attention. We'd love to make it right..."
      ]
    },
    bestPractices: [
      "Respond within 24 hours",
      "Be personal and authentic",
      "Address specific concerns",
      "Thank them for their time",
      "Invite them back"
    ]
  });
});

// Analyze sentiment
router.post('/analyze-sentiment', (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  
  // Simple sentiment analysis (in production use proper NLP)
  const positiveWords = ['great', 'amazing', 'excellent', 'perfect', 'love', 'best', 'fantastic', 'wonderful'];
  const negativeWords = ['bad', 'terrible', 'worst', 'poor', 'awful', 'disappointed', 'slow'];
  
  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  let sentiment = 'neutral';
  let score = 0.5;
  
  if (positiveCount > negativeCount) {
    sentiment = 'positive';
    score = Math.min(0.9, 0.5 + (positiveCount * 0.15));
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
    score = Math.max(0.1, 0.5 - (negativeCount * 0.15));
  }
  
  res.json({
    sentiment,
    score,
    confidence: 0.85,
    keywords: {
      positive: positiveWords.filter(word => lowerText.includes(word)),
      negative: negativeWords.filter(word => lowerText.includes(word))
    }
  });
});

module.exports = router;
