import express, { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();

const SYSTEM_PROMPT = `
Analyze the given text and extract numerical data that can be visualized.
Return a JSON object of the format:

{
  "dataSeries": [
    {
      "name": "Sales",
      "dataPoints": [
        {"name": "Q1", "value": 1200},
        {"name": "Q2", "value": 1500},
        {"name": "Q3", "value": 1800},
        {"name": "Q4", "value": 2100}
      ]
    },
    {
      "name": "Expenses",
      "dataPoints": [
        {"name": "Q1", "value": 900},
        {"name": "Q2", "value": 1100},
        {"name": "Q3", "value": 1300},
        {"name": "Q4", "value": 1600}
      ]
    }
  ],
  "recommendedChartType": "vertical_bar" | "horizontal_bar" | "line" | "area" | "pie" | "donut" | "bar_race",
  "chartTypeExplanation": "Line or bar chart best shows comparative multi-series data across categories.\nX axis represents quarter, Y axis represents Sales and Expenses values in units"
}

Only return valid JSON, no other text.
`

// Basic route
router.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the Data Visualization Server!');
});

// Example of a more complex route with type safety
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Define an interface for the request body
interface AnalyzeRequestBody {
  text: string;
}

router.post('/api/analyze', async (req: any, res: any) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  console.log('Received text:', text);

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
      // defaultHeaders: {
      //   'anthropic-beta': 'prompt-caching-2024-07-31'
      // }
    });

    const startTime = Date.now();
    const message: any = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: text
      }],
      temperature: 0,
      system: [{
        type: 'text',
        text: SYSTEM_PROMPT,
        // cache_control: {
        //   type: 'ephemeral'
        // }
      }]
    });
    const endTime = Date.now();
    const responseDuration = endTime - startTime;
    console.log(`Claude API Response Time: ${responseDuration} ms`);

    if (!message.content[0].text) {
      return res.status(500).json({ error: 'No response from Claude' });
    }

    const result = JSON.parse(message.content[0].text);
    res.json(result);
  } catch (error) {
    console.error('Claude API Error:', error);
    res.status(500).json({
      error: 'Failed to analyze text',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;