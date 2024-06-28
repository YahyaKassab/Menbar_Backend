const {OpenAI} =  require("openai");
const apiKey =process.env.SECRET_GPT_API_KEY
const openai = new OpenAI({apiKey}); 


exports.predictScore = async (meqData) => {
  try {
    // Construct the prompt in Arabic
    const prompt = `Evaluate the student_answer based on the optimal_answer to the provided question and assign a score out of 5. Consider the presence of keywords to increase the score. Use the following criteria:

5: The answer is comprehensive, covering all key points from the optimal answer.
4: Mostly accurate, with minor omissions or inaccuracies.
3: Partially accurate but lacks depth or misses important points.
2: Contains significant inaccuracies or misunderstandings, but includes some correct points.
1: Shows limited understanding, with few correct points.
0: Completely out of context (e.g., "don't know," jokes, irrelevant text, keyboard mashing, out of context text).
__________________________
question="${meqData.question}"
optimalAnswer= "${meqData.optimalAnswer}"
keywords= "${meqData.keywords}"
student_answer= "${meqData.student_answer}"
__________________________
just provide me the score only eg. 1,2,3,4,5 without any additional text.
_____________
This is an example of how you have to respond: 4`;

    // Request completion from ChatGPT-3.5 API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Specify the model here
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      max_tokens: 2, // Small max_tokens to ensure short response
      temperature: 0.7,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      stop: ["\n"] // Stop generation after the first line
    });

    // Process and interpret the response to generate a score out of 5
    const score = response.choices[0].message.content.trim();
    return score;
  } catch (error) {
    console.error('Error predicting score:', error);
    throw error;
  }
}

