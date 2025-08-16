// Size-based captions
const sizeCategories = {
  small: [
    "Tiny but mighty - proving size isn't everything!",
    "Good things come in small packages - like this masterpiece!",
    "Small in size but enormous in impact!",
    "Compact yet unforgettable - just like this moment!",
    "Don't underestimate me based on my size!",
    "Packing a powerful punch in a small frame!"
  ],
  medium: [
    "Just right - like the perfect cup of coffee!",
    "Perfectly balanced, as all things should be!",
    "Not too big, not too small - just perfectly shareable!",
    "The Goldilocks zone of visual content!",
    "Medium-sized but maximum enjoyment!",
    "The perfect portion for your viewing pleasure!"
  ],
  large: [
    "Big mood energy coming through!",
    "Go big or go home - and we chose BIG!",
    "Size does matter when it's this impressive!",
    "Large and in charge of your attention!",
    "Epic proportions for an epic moment!",
    "Warning: Oversized awesomeness ahead!"
  ]
};

// Organized by meme categories
const captionCategories = {
  reaction: [
    "My exact reaction when I saw this for the first time!",
    "That feeling when you realize this is pure gold!",
    "When you try to act normal but this is too relatable!",
    "When the universe aligns to create this perfect moment!",
    "That awkward moment when this happens... we've all been there!",
    "My face when I realize this is my new favorite thing!"
  ],
  advice: [
    "Pro tip: Save this for when you need a mood booster!",
    "Life hack: Share this with someone who needs a smile today!",
    "PSA: This content is scientifically proven to improve your day!",
    "Just saying... this deserves all the likes and shares!",
    "Friendly reminder: It's okay to laugh at simple pleasures!",
    "Words to live by: Always appreciate moments like this!"
  ],
  humor: [
    "This is fine. Everything is fine. Totally under control!",
    "I should not have laughed as hard as I did at this!",
    "Not sure if genius or ridiculous... and I love it!",
    "One does not simply scroll past without reacting to this!",
    "Yo dawg, I heard you like amazing content so we put amazing in your amazing!",
    "When you realize this is the quality content you signed up for!"
  ],
  inspirational: [
    "Proof that everyday moments can be extraordinary!",
    "Sometimes the simplest things bring the most joy!",
    "Let this be a reminder to find happiness in small things!",
    "Creativity is intelligence having fun - just like this!",
    "The world needs more of this kind of positivity!",
    "This right here? This is what life's about!"
  ],
  relatable: [
    "We've all been there, and we all know this feeling!",
    "Why is this so accurate it hurts?",
    "Every. Single. Time. Without fail!",
    "No explanation needed - we just understand!",
    "The struggle is real, but at least we can laugh about it!",
    "Who else feels personally attacked by how true this is?"
  ]
};

function generateCaptions(imageInfo) {
  const result = [];
  
  // Determine size category
  const size = imageInfo.size < 500000 ? 'small' : 
               imageInfo.size < 2000000 ? 'medium' : 'large';
  
  // Add size-specific caption
  const sizeCaptions = sizeCategories[size];
  result.push(sizeCaptions[Math.floor(Math.random() * sizeCaptions.length)]);
  
  // Get captions from different categories
  const usedCategories = new Set();
  
  while (result.length < 8 && usedCategories.size < Object.keys(captionCategories).length) {
    const categoryKeys = Object.keys(captionCategories);
    const randomCategory = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
    
    if (!usedCategories.has(randomCategory)) {
      usedCategories.add(randomCategory);
      const categoryCaptions = captionCategories[randomCategory];
      const randomCaption = categoryCaptions[Math.floor(Math.random() * categoryCaptions.length)];
      result.push(randomCaption);
    }
  }
  
  return result;
}

module.exports = { generateCaptions };