document.getElementById('slideForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const problem = document.getElementById('problem').value;
  const provocativeQuestion = document.getElementById('provocativeQuestion').value;
  const imageSuggestion = document.getElementById('imageSuggestion').value;

  document.getElementById('status').innerText = 'Generating your slide...';

  // Call ChatGPT to generate the slide content
  const slideContent = await generateSlideContent(problem, provocativeQuestion, imageSuggestion);

  // If slide content is generated, create and download the PowerPoint
  if (slideContent) {
    createPowerPointSlide(slideContent);
    document.getElementById('status').innerText = 'Slide generated! Download should begin shortly.';
  } else {
    document.getElementById('status').innerText = 'Failed to generate slide content.';
  }
});

async function generateSlideContent(problem, provocativeQuestion, imageSuggestion) {
  const apiKey = 'your-openai-api-key-here'; // Replace with your OpenAI API key

  const prompt = `
    I need to create a PowerPoint slide. Here’s the information:
    1. Customer's Problem: ${problem}
    2. Provocative Question: ${provocativeQuestion}
    3. Suggested Image Metaphor: ${imageSuggestion}
    
    Please create a slide with the following structure:
    - Title: The provocative question
    - Body: A brief description of the customer's problem
    - Suggest an appropriate image description that represents the metaphor.
  `;

  try {
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4', // You can use GPT-3.5 or GPT-4 depending on your access
        prompt: prompt,
        max_tokens: 150
      })
    });

    const data = await response.json();
    return data.choices[0].text.trim();
  } catch (error) {
    console.error('Error generating slide content:', error);
    return null;
  }
}

function createPowerPointSlide(content) {
  // Create a new presentation
  let pptx = new PptxGenJS();

  // Add a slide
  let slide = pptx.addSlide();

  // Extract title, body, and image suggestion from content
  const [title, body, imageDesc] = content.split('\n').map(line => line.trim());

  // Add title to the slide
  slide.addText(title, { x: 1, y: 0.5, fontSize: 24, bold: true });

  // Add body text to the slide
  slide.addText(body, { x: 1, y: 1.5, fontSize: 18, color: '363636' });

  // Add image suggestion as a placeholder
  slide.addText(`Suggested Image: ${imageDesc}`, { x: 1, y: 3, fontSize: 16, italic: true });

  // Save the PowerPoint
  pptx.writeFile({ fileName: 'GeneratedSlide.pptx' });
}
