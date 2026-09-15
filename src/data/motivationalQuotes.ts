export interface DailyQuote {
  id: number;
  quote: string;
  author: string;
  category: 'motivation' | 'study_tip' | 'physics_wisdom' | 'discipline' | 'mindset' | 'exam' | 'workplace' | 'knowledge' | 'custom';
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'any';
  subjects?: string[];
  actionType?: 'eye_timer' | 'drink_water' | 'deep_breath' | 'focus_25' | 'none';
  isCustom?: boolean;
  tag?: string;
}

export interface DailyQuiz {
  id: number;
  question: { my: string; en: string };
  options: { my: string[]; en: string[] };
  correctIndex: number;
  explanation: { my: string; en: string };
  category: string;
}

export interface MicroActionInfo {
  type: 'eye_timer' | 'drink_water' | 'deep_breath' | 'focus_25';
  title: { my: string; en: string };
  description: { my: string; en: string };
  duration?: number; // in seconds
  iconName: string;
}

export const MOTIVATIONAL_QUOTES: { my: DailyQuote[]; en: DailyQuote[] } = {
  en: [
    // Motivation
    { id: 1, quote: "The secret of getting ahead is getting started.", author: "Mark Twain", category: "motivation" },
    { id: 2, quote: "It always seems impossible until it's done.", author: "Nelson Mandela", category: "motivation" },
    { id: 3, quote: "Don't count the days, make the days count.", author: "Muhammad Ali", category: "motivation" },
    { id: 4, quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "motivation" },
    { id: 5, quote: "Focus on being productive instead of busy.", author: "Tim Ferriss", category: "discipline" },
    { id: 6, quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "mindset" },
    { id: 7, quote: "Action is the foundational key to all success.", author: "Pablo Picasso", category: "discipline" },
    { id: 8, quote: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma", category: "discipline" },
    { id: 9, quote: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "motivation" },
    { id: 10, quote: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki", category: "mindset" },
    { id: 11, quote: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln", category: "discipline" },
    { id: 12, quote: "The expert in anything was once a beginner.", author: "Helen Hayes", category: "mindset" },
    { id: 13, quote: "Wake up with determination, go to bed with satisfaction.", author: "George Horace Lorimer", category: "motivation" },
    { id: 14, quote: "Do what you have to do until you can do what you want to do.", author: "Oprah Winfrey", category: "motivation" },
    { id: 15, quote: "Great things never came from comfort zones.", author: "Neil Strauss", category: "motivation" },
    { id: 16, quote: "Dream big and dare to fail.", author: "Norman Vaughan", category: "motivation" },
    { id: 17, quote: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe", category: "discipline" },
    { id: 18, quote: "Strive for progress, not perfection.", author: "Unknown", category: "mindset" },
    { id: 19, quote: "Energy and persistence conquer all things.", author: "Benjamin Franklin", category: "discipline" },
    { id: 20, quote: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb", category: "mindset" },
    { id: 21, quote: "Difficulties in life are intended to make us better, not bitter.", author: "Dan Reeves", category: "mindset" },
    { id: 22, quote: "Opportunities don't happen, you create them.", author: "Chris Grosser", category: "motivation" },
    { id: 23, quote: "Work hard in silence, let your success be your noise.", author: "Frank Ocean", category: "discipline" },
    { id: 24, quote: "Consistency is what transforms average into excellence.", author: "Unknown", category: "discipline" },
    { id: 25, quote: "Your passion is waiting for your courage to catch up.", author: "Isabelle Lafleche", category: "motivation" },
    { id: 26, quote: "The mind is everything. What you think you become.", author: "Buddha", category: "mindset" },
    { id: 27, quote: "Turn your obstacles into opportunities and your problems into possibilities.", author: "Roy T. Bennett", category: "mindset" },
    { id: 28, quote: "Knowledge is power. Information is liberating. Education is the premise of progress.", author: "Kofi Annan", category: "study_tip" },
    { id: 29, quote: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar", category: "motivation" },
    { id: 30, quote: "Every day is a new beginning. Take a deep breath and start again.", author: "Unknown", category: "mindset" },
    { id: 31, quote: "Patience, persistence and perspiration make an unbeatable combination for success.", author: "Napoleon Hill", category: "discipline" },
    { id: 32, quote: "Look up at the stars and not down at your feet. Try to make sense of what you see.", author: "Stephen Hawking", category: "physics_wisdom" },
    { id: 33, quote: "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.", author: "Marie Curie", category: "physics_wisdom" },
    { id: 34, quote: "If I have seen further than others, it is by standing upon the shoulders of giants.", author: "Isaac Newton", category: "physics_wisdom" },
    { id: 35, quote: "Imagination is more important than knowledge. For knowledge is limited, whereas imagination embraces the entire world.", author: "Albert Einstein", category: "physics_wisdom" },
    { id: 36, quote: "The important thing is not to stop questioning. Curiosity has its own reason for existing.", author: "Albert Einstein", category: "physics_wisdom" },
    { id: 37, quote: "We suffer more often in imagination than in reality.", author: "Seneca", category: "mindset" },
    { id: 38, quote: "You have power over your mind - not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius", category: "mindset" },
    { id: 39, quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle", category: "discipline" },
    { id: 40, quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", category: "discipline" },
    { id: 41, quote: "I fear not the man who has practiced 10,000 kicks once, but I fear the man who has practiced one kick 10,000 times.", author: "Bruce Lee", category: "discipline" },
    { id: 42, quote: "One child, one teacher, one book, one pen can change the world.", author: "Malala Yousafzai", category: "motivation" },
    { id: 43, quote: "When something is important enough, you do it even if the odds are not in your favor.", author: "Elon Musk", category: "motivation" },
    { id: 44, quote: "If you are born poor it's not your mistake, but if you die poor it is your mistake.", author: "Bill Gates", category: "motivation" },
    { id: 45, quote: "Do not pray for an easy life, pray for the strength to endure a difficult one.", author: "Bruce Lee", category: "mindset" },
    
    // Study Tips & Exam Mastery
    { id: 46, quote: "Pomodoro Technique: Study for 25 minutes with zero distractions, then rest your eyes and stretch for 5 minutes.", author: "Study Mastery Tip", category: "study_tip" },
    { id: 47, quote: "Feynman Technique: Explain complex concepts in simple words as if teaching a 10-year-old child.", author: "Richard Feynman", category: "study_tip" },
    { id: 48, quote: "Spaced Repetition: Review notes at day 1, day 3, day 7, and day 21 to lock facts permanently into long-term memory.", author: "Neuroscience Memory Tip", category: "study_tip" },
    { id: 49, quote: "Active Recall: Close your book after reading a chapter and write down everything you remember on a blank paper.", author: "Active Study Method", category: "study_tip" },
    { id: 50, quote: "2-Minute Rule: If a task takes less than 2 minutes to complete (like preparing books or reviewing notes), do it right now.", author: "David Allen", category: "discipline" },
    { id: 51, quote: "Eat the Frog: Tackle the hardest, most daunting subject first thing in the morning when your mental energy is highest.", author: "Brian Tracy", category: "discipline" },
    { id: 52, quote: "Exam Tip: Read the entire question paper calmly first, and answer high-confidence questions first to build momentum.", author: "Exam Strategy", category: "exam" },
    { id: 53, quote: "Sleep is when the brain consolidates learning. 7-8 hours of quality sleep enhances memory retention by 40%.", author: "Cognitive Science", category: "study_tip" },
    { id: 54, quote: "Hydration Boost: Drinking a glass of water before study sessions increases attention span and cognitive alertness by 14%.", author: "Brain Health Tip", category: "study_tip" },
    { id: 55, quote: "Blurting Method: Set a 15-minute timer, blurt out all equations and key terms on a whiteboard without checking your notes.", author: "Revision Technique", category: "exam" },
    { id: 56, quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "motivation" },
    { id: 57, quote: "The secret of success is to do the common things uncommonly well.", author: "John D. Rockefeller", category: "discipline" },
    { id: 58, quote: "You don't have to be extreme, just consistent.", author: "Anonymous", category: "discipline" },
    { id: 59, quote: "Action may not always bring happiness, but there is no happiness without action.", author: "William James", category: "motivation" },
    { id: 60, quote: "Well done is better than well said.", author: "Benjamin Franklin", category: "discipline" },
    { id: 61, quote: "There are no shortcuts to any place worth going.", author: "Beverly Sills", category: "motivation" },
    { id: 62, quote: "Fall seven times, stand up eight.", author: "Japanese Proverb", category: "mindset" },
    { id: 63, quote: "Everything you've ever wanted is on the other side of fear.", author: "George Addair", category: "mindset" },
    { id: 64, quote: "Opportunities are usually disguised by hard work, so most people don't recognize them.", author: "Ann Landers", category: "discipline" },
    { id: 65, quote: "The man who moves a mountain begins by carrying away small stones.", author: "Confucius", category: "motivation" },
    { id: 66, quote: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt", category: "motivation" },
    { id: 67, quote: "Learning never exhausts the mind.", author: "Leonardo da Vinci", category: "study_tip" },
    { id: 68, quote: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King", category: "study_tip" },
    { id: 69, quote: "Education is not the learning of facts, but the training of the mind to think.", author: "Albert Einstein", category: "study_tip" },
    { id: 70, quote: "A person who never made a mistake never tried anything new.", author: "Albert Einstein", category: "mindset" },
    { id: 71, quote: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau", category: "discipline" },
    { id: 72, quote: "Keep your face to the sunshine and you cannot see a shadow.", author: "Helen Keller", category: "mindset" },
    { id: 73, quote: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis", category: "motivation" },
    { id: 74, quote: "Limit your 'always' and your 'nevers'.", author: "Amy Poehler", category: "mindset" },
    { id: 75, quote: "The best revenge is massive success.", author: "Frank Sinatra", category: "motivation" },
    { id: 76, quote: "Perseverance is not a long race; it is many short races one after the other.", author: "Walter Elliot", category: "discipline" },
    { id: 77, quote: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", category: "mindset" },
    { id: 78, quote: "Start where you are, with what you have, because what you have is enough.", author: "Chris Gardner", category: "motivation" },
    { id: 79, quote: "Don't let yesterday take up too much of today.", author: "Will Rogers", category: "mindset" },
    { id: 80, quote: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle", category: "mindset" },
    { id: 81, quote: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela", category: "motivation" },
    { id: 82, quote: "Be the change that you wish to see in the world.", author: "Mahatma Gandhi", category: "mindset" },
    { id: 83, quote: "In character, in manner, in style, the supreme excellence is simplicity.", author: "Henry Wadsworth Longfellow", category: "discipline" },
    { id: 84, quote: "Tell me and I forget. Teach me and I remember. Involve me and I learn.", author: "Benjamin Franklin", category: "study_tip" },
    { id: 85, quote: "The unexamined life is not worth living.", author: "Socrates", category: "mindset" },
    { id: 86, quote: "Knowing is not enough; we must apply. Willing is not enough; we must do.", author: "Johann Wolfgang von Goethe", category: "discipline" },
    { id: 87, quote: "Life is what happens when you're busy making other plans.", author: "John Lennon", category: "mindset" },
    { id: 88, quote: "Spread love everywhere you go. Let no one ever come to you without leaving happier.", author: "Mother Teresa", category: "motivation" },
    { id: 89, quote: "When you reach the end of your rope, tie a knot in it and hang on.", author: "Franklin D. Roosevelt", category: "motivation" },
    { id: 90, quote: "Never give in except to convictions of honor and good sense.", author: "Winston Churchill", category: "discipline" },
    { id: 91, quote: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci", category: "mindset" },
    { id: 92, quote: "Change your thoughts and you change your world.", author: "Norman Vincent Peale", category: "mindset" },
    { id: 93, quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "motivation" },
    { id: 94, quote: "If you judge people, you have no time to love them.", author: "Mother Teresa", category: "mindset" },
    { id: 95, quote: "To handle yourself, use your head; to handle others, use your heart.", author: "Eleanor Roosevelt", category: "discipline" },
    { id: 96, quote: "Happiness is not something ready made. It comes from your own actions.", author: "Dalai Lama", category: "mindset" },
    { id: 97, quote: "Peace comes from within. Do not seek it without.", author: "Buddha", category: "mindset" },
    { id: 98, quote: "It always seems impossible until it’s done.", author: "Nelson Mandela", category: "motivation" },
    { id: 99, quote: "Failure is simply the opportunity to begin again, this time more intelligently.", author: "Henry Ford", category: "mindset" },
    { id: 100, quote: "Quality is not an act, it is a habit.", author: "Aristotle", category: "discipline" },
    { id: 101, quote: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", author: "Ralph Waldo Emerson", category: "mindset" },
    { id: 102, quote: "It is not length of life, but depth of life.", author: "Ralph Waldo Emerson", category: "mindset" },
    { id: 103, quote: "Act as if what you do makes a difference. It does.", author: "William James", category: "motivation" },
    { id: 104, quote: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill", category: "motivation" },
    { id: 105, quote: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle", category: "mindset" },
    { id: 106, quote: "The journey of a thousand miles begins with one step.", author: "Lao Tzu", category: "motivation" },
    { id: 107, quote: "That which does not kill us makes us stronger.", author: "Friedrich Nietzsche", category: "mindset" },
    { id: 108, quote: "Life is 10% what happens to you and 90% how you react to it.", author: "Charles R. Swindoll", category: "mindset" },
    { id: 109, quote: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin", category: "study_tip" },
    { id: 110, quote: "Curiosity is the wick in the candle of learning.", author: "William Arthur Ward", category: "study_tip" },
    { id: 111, quote: "Change your life today. Don't gamble on the future, act now, without delay.", author: "Simone de Beauvoir", category: "discipline" },
    { id: 112, quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant", category: "discipline" },
    { id: 113, quote: "Doubt kills more dreams than failure ever will.", author: "Suzy Kassem", category: "mindset" },
    { id: 114, quote: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche", category: "motivation" },
    { id: 115, quote: "Silence is a source of great strength.", author: "Lao Tzu", category: "discipline" },
    { id: 116, quote: "If you want to lift yourself up, lift up someone else.", author: "Booker T. Washington", category: "motivation" },
    { id: 117, quote: "I would rather die of passion than of boredom.", author: "Vincent van Gogh", category: "motivation" },
    { id: 118, quote: "Do not go where the path may lead, go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson", category: "motivation" },
    { id: 119, quote: "The best way to predict the future is to create it.", author: "Peter Drucker", category: "mindset" },
    { id: 120, quote: "Keep your eyes on the stars, and your feet on the ground.", author: "Theodore Roosevelt", category: "physics_wisdom" },
    { id: 121, quote: "Wisdom begins in wonder.", author: "Socrates", category: "study_tip" },
    { id: 122, quote: "Tell me and I forget, teach me and I may remember, involve me and I learn.", author: "Xun Kuang", category: "study_tip" },
    { id: 123, quote: "Action is the real measure of intelligence.", author: "Napoleon Hill", category: "discipline" },
    { id: 124, quote: "The secret of getting ahead is getting started.", author: "Mark Twain", category: "motivation" },
    { id: 125, quote: "To succeed, your desire for success should be greater than your fear of failure.", author: "Bill Cosby", category: "motivation" },
    { id: 126, quote: "Opportunities don't happen, you create them through hard work and professional focus.", author: "Chris Grosser", category: "workplace" },
    { id: 127, quote: "Great accomplishments are not achieved by strength, but by professional perseverance.", author: "Samuel Johnson", category: "workplace" },
    { id: 128, quote: "Professional excellence is not a skill, it is an attitude of continuous improvement.", author: "Ralph Marston", category: "workplace" },
    { id: 129, quote: "Work hard in silence, let your professional achievements be your noise.", author: "Frank Ocean", category: "workplace" },
    { id: 130, quote: "Leadership is not about being in charge. It is about taking care of those in your charge.", author: "Simon Sinek", category: "workplace" },
    { id: 131, quote: "The Pomodoro Technique works because human focus naturally peaks in 25-minute intervals before cognitive fatigue sets in.", author: "Cognitive Science", category: "knowledge" },
    { id: 132, quote: "Learning right before sleeping enhances memory retention as the hippocampus consolidates information during REM sleep.", author: "Neuroscience Fact", category: "knowledge" },
    { id: 133, quote: "The Feynman Technique: If you cannot explain a concept in simple terms to a 10-year-old child, you do not fully understand it yet.", author: "Richard Feynman", category: "knowledge" },
    { id: 134, quote: "The Zeigarnik Effect shows that the human brain remembers uncompleted or interrupted tasks much better than completed ones.", author: "Psychology Fact", category: "knowledge" },
    { id: 135, quote: "Drinking a glass of water immediately after waking up boosts your metabolic rate by 24% and clears morning brain fog.", author: "Health Science", category: "knowledge" },
    { id: 136, quote: "The 20-20-20 Rule: Every 20 minutes, look at an object 20 feet away for 20 seconds to prevent digital eye strain.", author: "Optometry Rule", category: "knowledge" },
    { id: 137, quote: "A 10-minute walk after intense studying increases BDNF (Brain-Derived Neurotrophic Factor), accelerating neuron connections.", author: "Neurobiology", category: "knowledge" },
    { id: 138, quote: "Spaced Repetition: Reviewing material at increasing intervals (1 day, 3 days, 7 days) improves retention by over 200%.", author: "Learning Science", category: "knowledge" },
    { id: 139, quote: "Active Recall (testing yourself) stimulates neural pathways far more effectively than passive re-reading of textbooks.", author: "Educational Psychology", category: "knowledge" },
    { id: 140, quote: "The Pareto Principle (80/20 Rule): 80% of your academic or career results stem from 20% of your most focused efforts.", author: "Vilfredo Pareto", category: "knowledge" },
    { id: 141, quote: "Neuroplasticity proves that the human brain can physically restructure and build new neural pathways at any age.", author: "Neuroscience", category: "knowledge" },
    { id: 142, quote: "Dual-Coding Theory: Combining visual diagrams with concise text notes doubles information retention compared to text alone.", author: "Allan Paivio", category: "knowledge" },
    { id: 143, quote: "The Blurting Method: Read a topic for 15 minutes, close the book, write everything you recall, then fill in missing gaps.", author: "Study Technique", category: "knowledge" },
    { id: 144, quote: "It takes an average of 23 minutes to regain deep cognitive focus after being interrupted by a smartphone notification.", author: "UC Irvine Study", category: "knowledge" },
    { id: 145, quote: "Parkinson's Law: Work expands to fill the time allotted for its completion. Setting shorter artificial deadlines boosts speed.", author: "C. Northcote Parkinson", category: "knowledge" },
    { id: 146, quote: "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.", author: "Roy T. Bennett", category: "motivation" },
    { id: 147, quote: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt", category: "motivation" },
    { id: 148, quote: "Hydration during long study sessions prevents cognitive decline. Even mild dehydration (1-2%) can impair performance.", author: "Health Science", category: "knowledge" },
    { id: 149, quote: "Stretching for 2 minutes after every 45 minutes of sitting down increases blood flow to the brain, enhancing overall mental focus.", author: "Ergonomics Fact", category: "knowledge" },
    { id: 150, quote: "Reducing blue light exposure 1 hour before sleeping increases melatonin production, ensuring deeper and more restorative sleep.", author: "Sleep Foundation", category: "knowledge" },
    { id: 151, quote: "The Pomodoro Technique is effective because it creates a sense of urgency, bypassing the brain's natural tendency to procrastinate.", author: "Productivity Science", category: "knowledge" },
    { id: 152, quote: "A well-organized physical desk directly correlates with lower cortisol levels, reducing stress and anxiety while working.", author: "Environmental Psychology", category: "knowledge" },
    { id: 153, quote: "Effective communication is 70% listening and 30% speaking. Understanding before being understood builds strong workplace relations.", author: "Workplace Rule", category: "workplace" },
    { id: 154, quote: "Arriving 5 minutes early to any workplace meeting allows you to settle mentally, showing respect for your colleagues' time.", author: "Professional Etiquette", category: "workplace" },
    { id: 155, quote: "Taking full ownership of a mistake and offering a constructive solution is the fastest way to build trust and credibility in any job.", author: "Professional Wisdom", category: "workplace" },
    { id: 156, quote: "A growth mindset believes that intelligence can be developed. View challenges as opportunities to learn rather than threats to avoid.", author: "Carol Dweck", category: "mindset" },
    { id: 157, quote: "Gratitude shifts your focus from what your life lacks to the abundance that is already present. Start each day by noting three things you are thankful for.", author: "Mindset Wisdom", category: "mindset" },
    { id: 158, quote: "Do not compare your Chapter 1 with someone else's Chapter 20. Everyone's journey is unique, and progress is personal.", author: "Mindset Tip", category: "mindset" },
    { id: 159, quote: "Teaching others is the ultimate form of study. It forces your brain to organize information in a coherent, structured logical path.", author: "Educational Science", category: "study_tip" },
    { id: 160, quote: "To master any subject, split it into chunks. The brain processes small, focused concepts much more easily than massive textbooks.", author: "Cognitive Psychology", category: "study_tip" },
    { id: 161, quote: "Eating foods rich in Omega-3 fatty acids, like walnuts and seeds, supports brain structure and improves memory retention.", author: "Nutritional Science", category: "knowledge" },
    { id: 162, quote: "Education is not preparation for life; education is life itself.", author: "John Dewey", category: "study_tip" },
    { id: 163, quote: "Focus on learning for mastery, not just to pass exams. Real education stays with you long after the test is over.", author: "Educational Wisdom", category: "study_tip" },
    { id: 164, quote: "Workplace collaboration succeeds when team members share knowledge freely. Siloed information slows down progress.", author: "Business Practice", category: "workplace" },
    { id: 165, quote: "Protecting your posture during office hours prevents long-term spine fatigue. Keep your monitor at eye level.", author: "Ergonomics Rule", category: "knowledge" }
  ],
  my: [
    // Motivation
    { id: 1, quote: "ခရီးဝေးသို့ရောက်ရန် ပထမဆုံးခြေလှမ်းမှ စတင်ရ၏။", author: "မာ့ခ် တွိန်း", category: "motivation" },
    { id: 2, quote: "မလုပ်ဆောင်မီအထိ မဖြစ်နိုင်ဘူးလို့ ထင်ရသော်လည်း လုပ်ဆောင်ပြီးပါက ဖြစ်မြောက်သွားစမြဲပါ။", author: "နယလ်ဆင် မန်ဒဲလား", category: "motivation" },
    { id: 3, quote: "ရက်များကို ရေတွက်မနေပါနှင့်၊ ရက်များကို တန်ဖိုးရှိအောင် ဖန်တီးပါ။", author: "မူဟာမက် အလီ", category: "discipline" },
    { id: 4, quote: "အောင်မြင်မှုဆိုသည်မှာ အဆုံးမဟုတ်၊ ကျရှုံးမှုသည်လည်း သေကြောင်းမဟုတ်၊ ရှေ့ဆက်ရန် သတ္တိရှိခြင်းကသာ အဓိကဖြစ်သည်။", author: "ဝင်းစတန် ချာချီ", category: "motivation" },
    { id: 5, quote: "အလုပ်များနေခြင်းထက် ထိရောက်သောအလုပ် လုပ်ဆောင်ခြင်းပေါ်တွင် အာရုံစိုက်ပါ။", author: "တမ် ဖဲရစ်", category: "discipline" },
    { id: 6, quote: "မိမိကိုယ်ကို လုပ်နိုင်သည်ဟု ယုံကြည်ပါ၊ သင် ထက်ဝက်အောင်မြင်သွားပါပြီ။", author: "သီအိုဒို ရူးစဗဲ့", category: "mindset" },
    { id: 7, quote: "လက်တွေ့လှုပ်ရှားမှုသည် အောင်မြင်မှုအားလုံး၏ အဓိကသော့ချက်ဖြစ်သည်။", author: "ပါပလို ပီကာဆို", category: "discipline" },
    { id: 8, quote: "နေ့စဉ် သေးငယ်သော တိုးတက်မှုများသည် အချိန်တန်လျှင် ကြီးမားသော အောင်မြင်မှုကို ဆောင်ကြဉ်းပေးသည်။", author: "ရိုဘင် ရှာမား", category: "discipline" },
    { id: 9, quote: "ကြီးမားသော အလုပ်များကို လုပ်ဆောင်နိုင်သည့် တစ်ခုတည်းသော နည်းလမ်းမှာ မိမိလုပ်နေသော အလုပ်ကို ချစ်မြတ်နိုးခြင်းဖြစ်သည်။", author: "စတိဗ် ဂျော့ဗ်", category: "motivation" },
    { id: 10, quote: "သင်၏ အနာဂတ်ကို မနက်ဖြန်တွင် လုပ်ဆောင်မည့်အရာထက် ယနေ့လုပ်ဆောင်သော အရာက ဖန်တီးပေးသည်။", author: "ရော့ဘတ် ကီယိုဆာကီ", category: "mindset" },
    { id: 11, quote: "စည်းကမ်းဆိုသည်မှာ ယခုခဏ လိုချင်သောအရာနှင့် အလိုချင်ဆုံးသော အရာကြား ရွေးချယ်ခြင်းဖြစ်သည်။", author: "အေဘရာဟမ် လင်းကွန်း", category: "discipline" },
    { id: 12, quote: "မည်သည့်နယ်ပယ်တွင်မဆို ကျွမ်းကျင်သူသည်လည်း တစ်ချိန်က စတင်သူသာ ဖြစ်ခဲ့ဖူးသည်။", author: "ဟယ်လင် ဟေးစ်", category: "mindset" },
    { id: 13, quote: "ပြတ်သားသော ဆုံးဖြတ်ချက်ဖြင့် နိုးထပါ၊ ကျေနပ်အားရစွာဖြင့် အိပ်စက်ပါ။", author: "ဂျော့ချ် ဟိုးရေ့စ်", category: "motivation" },
    { id: 14, quote: "မိမိပြုလုပ်လိုသောအရာကို မလုပ်နိုင်မီအထိ ပြုလုပ်ရန် လိုအပ်သောအရာကို ကြိုးစားလုပ်ဆောင်ပါ။", author: "အိုပရာ ဝင်းဖရီး", category: "motivation" },
    { id: 15, quote: "ကြီးမားသော အရာများသည် သက်သောင့်သက်သာရှိသော နယ်ပယ်မှ ဘယ်တော့မှ မထွက်ပေါ်လာပါ။", author: "နေးလ် စထရောက်စ်", category: "motivation" },
    { id: 16, quote: "ကြီးမားစွာ အိပ်မက်မက်ပါ၊ ကျရှုံးမှုကို ရဲဝံ့စွာ ရင်ဆိုင်ပါ။", author: "နော်မန် ဗောဂန်", category: "motivation" },
    { id: 17, quote: "သင် ရောက်ရှိနေသည့်နေရာမှ စတင်ပါ၊ သင့်တွင် ရှိသောအရာကို သုံးပါ၊ သင် လုပ်နိုင်သည်ကို လုပ်ဆောင်ပါ။", author: "အာသာ အက်ရှ်", category: "discipline" },
    { id: 18, quote: "ပြီးပြည့်စုံမှုထက် တိုးတက်မှုကို ကြိုးစားအားထုတ်ပါ။", author: "အမည်မသိ", category: "mindset" },
    { id: 19, quote: "ဇွဲထက်သန်မှုနှင့် ခွန်အားသည် အခက်အခဲအားလုံးကို အောင်နိုင်စေသည်။", author: "ဘင်ဂျမင် ဖရန်ကလင်", category: "discipline" },
    { id: 20, quote: "သစ်ပင်စိုက်ရန် အကောင်းဆုံးအချိန်မှာ လွန်ခဲ့သော နှစ် ၂၀ ကဖြစ်ပြီး၊ ဒုတိယအကောင်းဆုံးအချိန်မှာ ယခုပင်ဖြစ်သည်။", author: "တရုတ် စကားပုံ", category: "mindset" },
    { id: 21, quote: "ဘဝ၏ အခက်အခဲများသည် ကျွန်ုပ်တို့ကို ပိုမိုရင့်ကျက်သန်မာစေရန် ရည်ရွယ်ခြင်းဖြစ်သည်။", author: "ဒန် ရီးဗ်", category: "mindset" },
    { id: 22, quote: "အခွင့်အရေးများစွာသည် အလိုအလျောက် ပေါ်မလာပါ၊ သင်ကိုယ်တိုင် ဖန်တီးယူရမည်ဖြစ်သည်။", author: "ခရစ် ဂရော့ဆာ", category: "motivation" },
    { id: 23, quote: "တိတ်ဆိတ်စွာ ကြိုးစားပါ၊ သင်၏ အောင်မြင်မှုကိုသာ အသံကျယ်ကျယ် ပျံ့လွင့်ပါစေ။", author: "ဖရန့်ခ် အိုရှန်း", category: "discipline" },
    { id: 24, quote: "မှန်မှန်ပြုလုပ်သော ဇွဲရှိမှုသည် ပုံမှန်အရာကို ထူးချွန်ထက်မြက်အောင် ပြောင်းလဲပေးသည်။", author: "အမည်မသိ", category: "discipline" },
    { id: 25, quote: "သင်၏ ရည်မှန်းချက်သည် သင့်သတ္တိ၏ ပံ့ပိုးမှုကို စောင့်ဆိုင်းနေသည်။", author: "အိဆာဘဲလ် လာဖလက်ခ်", category: "motivation" },
    { id: 26, quote: "စိတ်သည် အရာရာ၏ ရှေ့သွားဖြစ်သည်။ သင် တွေးသည့်အတိုင်း သင် ဖြစ်လာသည်။", author: "ဗုဒ္ဓမြတ်စွာဘုရား", category: "mindset" },
    { id: 27, quote: "သင်၏ အခက်အခဲများကို အခွင့်အရေးများအဖြစ် ပြောင်းလဲလိုက်ပါ။", author: "ရွိုင်း တီ ဘန်းနက်", category: "mindset" },
    { id: 28, quote: "အသိပညာသည် စွမ်းအားဖြစ်သည်။ ဗဟုသုတသည် လွတ်မြောက်ခြင်းဖြစ်သည်။ ပညာရေးသည် တိုးတက်မှု၏ အခြေခံဖြစ်သည်။", author: "ကိုဖီ အာနန်", category: "study_tip" },
    { id: 29, quote: "စတင်ရန်အတွက် သင် ကြီးကျယ်နေရန် မလိုပါ၊ သို့သော် ကြီးကျယ်ရန်အတွက် သင် စတင်ရမည်။", author: "ဇိဂ် ဇိဂ်လာ", category: "motivation" },
    { id: 30, quote: "နေ့ရက်တိုင်းသည် စတင်ခြင်းအသစ်ဖြစ်၏။ အသက်ပြင်းပြင်းရှုပြီး ပြန်လည်စတင်ပါ။", author: "အမည်မသိ", category: "mindset" },
    { id: 31, quote: "သည်းခံခြင်း၊ ဇွဲရှိခြင်းနှင့် ချွေးထွက်အောင် ကြိုးစားခြင်းတို့သည် အောင်မြင်မှု၏ အဓိကသော့ချက်များ ဖြစ်ကြသည်။", author: "နပိုလီယံ ဟေးလ်", category: "discipline" },
    { id: 32, quote: "ကြိုးစားက ဘုရားဖြစ်၊ အားထုတ်က အောင်မြင်ရမည်။ မည်သည့်အရာမဆို မလျှော့သောဇွဲဖြင့် အောင်မြင်နိုင်သည်။", author: "မြန်မာဆိုရိုးစကား", category: "motivation" },
    { id: 33, quote: "ပညာရဲရင့် ပွဲလယ်တင့်။ ပညာကို ကြိုးစားသင်ယူသူသည် မည်သည့်နေရာမဆို ဂုဏ်သိက္ခာရှိစွာ ရပ်တည်နိုင်သည်။", author: "မြန်မာစကားပုံ", category: "study_tip" },
    { id: 34, quote: "အချိန်နှင့် ဒီရေသည် လူကိုမစောင့်။ ယခုလက်ရှိအချိန်ကို အကျိုးအရှိဆုံး အသုံးချပါ။", author: "မြန်မာဆိုရိုးစကား", category: "discipline" },
    { id: 35, quote: "အဝေးကိုကြည့်ပါက ခြေလှမ်းမလွဲပါစေနှင့်။ အမြင့်ကိုမှန်းပါက အောက်ခြေခိုင်အောင် အရင်ကြိုးစားပါ။", author: "ပညာရှိ စကား", category: "mindset" },
    { id: 36, quote: "စိတ်ဓာတ်မကျပါနှင့်၊ ယနေ့ကြုံတွေ့ရသော အခက်အခဲသည် မနက်ဖြန်အတွက် အတွေ့အကြုံကောင်း ဖြစ်လာပါလိမ့်မည်။", author: "ခွန်အားဖြည့်စကား", category: "mindset" },
    { id: 37, quote: "သူများထက် ပိုသိချင်လျှင် သူများထက် ပိုဖတ်ပါ၊ သူများထက် ပိုတော်ချင်လျှင် သူများထက် ပိုကြိုးစားပါ။", author: "အောင်မြင်ရေး လမ်းညွှန်", category: "discipline" },
    { id: 38, quote: "မဖြစ်နိုင်ဘူးဆိုတာ လူတွေရဲ့ စိတ်ကူးထဲမှာပဲ ရှိတာပါ။ လက်တွေ့မှာ မကြိုးစားသေးတာသာ ဖြစ်ပါတယ်။", author: "စိတ်ခွန်အား စာစု", category: "motivation" },
    { id: 39, quote: "စိတ်ရှည်ခြင်းသည် ခါးသီးသော်လည်း ၎င်း၏ အသီးအပွင့်သည် အလွန်ချိုမြိန်သည်။", author: "အရစ္စတိုတယ် (Aristotle)", category: "discipline" },
    { id: 40, quote: "အမှားလုပ်မိခြင်းသည် ကျရှုံးခြင်းမဟုတ်ပါ၊ အမှားမှ သင်ခန်းစာ မယူခြင်းကသာ အစစ်အမှန် ကျရှုံးခြင်းဖြစ်သည်။", author: "ကွန်ဖြူးရှပ် (Confucius)", category: "mindset" },
    { id: 41, quote: "သင့်ရဲ့ အချိန်ကို အခြားသူတစ်ယောက်ရဲ့ ဘဝအတိုင်း ရှင်သန်ရင်း ဖြုန်းတီးမပစ်ပါနဲ့။", author: "စတိဗ် ဂျော့ဗ် (Steve Jobs)", category: "motivation" },
    { id: 42, quote: "ကောင်းကင်ယံမှ ကြယ်များကို မော့ကြည့်ပါ၊ ခြေထောက်အောက်ကိုပဲ ငုံ့မကြည့်ပါနဲ့။ မြင်တွေ့ရသည်များကို နားလည်အောင် ကြိုးစားပါ။", author: "စတီဖင် ဟောကင်း (Stephen Hawking)", category: "physics_wisdom" },
    { id: 43, quote: "ဘဝတွင် ကြောက်ရွံ့စရာ ဘာမျှမရှိပါ၊ နားလည်အောင် လေ့လာရုံသာရှိသည်။ ပိုမိုနားလည်လေ ကြောက်ရွံ့မှု လျော့နည်းလေဖြစ်သည်။", author: "မေရီ ကျူရီ (Marie Curie)", category: "physics_wisdom" },
    { id: 44, quote: "ကျွန်ုပ် အခြားသူများထက် ပိုမိုဝေးဝေး မြင်နိုင်ခဲ့ပါက ဧရာမဘီလူးကြီးများ၏ ပခုံးပေါ်တွင် ရပ်တည်နိုင်ခဲ့သောကြောင့် ဖြစ်သည်။", author: "အိုင်ဆက် နယူတန် (Isaac Newton)", category: "physics_wisdom" },
    { id: 45, quote: "စိတ်ကူးဉာဏ်သည် အသိပညာထက် ပို၍အရေးကြီးသည်။ အသိပညာသည် အကန့်အသတ်ရှိသော်လည်း စိတ်ကူးဉာဏ်သည် ကမ္ဘာလောကကြီးတစ်ခုလုံးကို လွှမ်းခြုံနိုင်သည်။", author: "အဲလ်ဘတ် အိုင်းစတိုင်း (Albert Einstein)", category: "physics_wisdom" },
    
    // Study Tips & Exam Mastery (လက်တွေ့ စာကျက်နည်းနှင့် စာမေးပွဲ အကြံပြုချက်များ)
    { id: 46, quote: "Pomodoro စာကျက်နည်း - ၂၅ မိနစ် ဖုန်းနှင့် အခြားအရာများလုံးဝမကြည့်ဘဲ အာရုံစိုက်စာကျက်ပါ။ ပြီးလျှင် ၅ မိနစ် မျက်စိအနားပေးပြီး ခန္ဓာကိုယ်ဆန့်ထုတ်ပါ။", author: "Pomodoro စာကျက်နည်းလမ်း", category: "study_tip" },
    { id: 47, quote: "Feynman စာကျက်နည်း - မိမိသင်ယူထားသည်များကို အသက် ၁၀ နှစ်အရွယ် ကလေးတစ်ယောက် နားလည်လွယ်အောင် ရိုးရှင်းသော စကားလုံးများဖြင့် ပြန်လည်ရှင်းပြ လေ့ကျင့်ပါ။", author: "ရစ်ချက် ဖိုင်းမန်း (Richard Feynman)", category: "study_tip" },
    { id: 48, quote: "Spaced Repetition စနစ် - သင်ခန်းစာကို ၁ ရက်မြောက်၊ ၃ ရက်မြောက်၊ ၇ ရက်မြောက်နှင့် ၂၁ ရက်မြောက်တို့တွင် ထပ်မံနွှေးပေးခြင်းဖြင့် ရေရှည်မှတ်ဉာဏ်ထဲ စွဲမြဲသွားစေပါသည်။", author: "ဦးနှောက်မှတ်ဉာဏ် လျှို့ဝှက်ချက်", category: "study_tip" },
    { id: 49, quote: "Active Recall (စာအုပ်ပိတ် ပြန်ရေးနည်း) - စာတစ်ခန်းဖတ်ပြီးပါက စာအုပ်ကိုပိတ်ပြီး စာရွက်အလွတ်ပေါ်တွင် မှတ်မိသမျှ ပြန်လည်ချရေးကြည့်ပါ။ မှတ်ဉာဏ် ၃ ဆ ပိုတက်စေပါသည်။", author: "ထိရောက်သော စာကျက်နည်း", category: "study_tip" },
    { id: 50, quote: "၂ မိနစ် စည်းမျဉ်း - စာအုပ်ပြင်ဆင်ခြင်း၊ စာမျက်နှာဖွင့်ခြင်းစသည့် ၂ မိနစ်အတွင်း လုပ်ဆောင်နိုင်သောအရာများကို မဆိုင်းမတွ ယခုချက်ချင်း လုပ်ဆောင်ပါ။", author: "အချိန်စီမံခန့်ခွဲမှု နည်းလမ်း", category: "discipline" },
    { id: 51, quote: "အခက်ဆုံး အကြောင်းအရာကို မနက်ပိုင်း ဦးစွာလုပ်ဆောင်ပါ (Eat the Frog) - မနက်ခင်း စိတ်လန်းဆန်းချိန်တွင် အခက်ဆုံး ဘာသာရပ်ကို အရင်ကျက်ပါ။", author: "ဘရိုင်ယန် ထရေစီ", category: "discipline" },
    { id: 52, quote: "စာမေးပွဲ ဖြေဆိုနည်း - မေးခွန်းစာရွက်ကို စိတ်အေးချမ်းစွာ အရင်ဆုံး အစအဆုံးဖတ်ပါ။ သေချာကျိန်းသေသိသော မေးခွန်းများကို အရင်ဦးစားပေးဖြေဆိုပြီး ယုံကြည်မှု တည်ဆောက်ပါ။", author: "စာမေးပွဲ ဗျူဟာ", category: "exam" },
    { id: 53, quote: "အိပ်စက်ခြင်းသည် ဦးနှောက်က မှတ်ဉာဏ်များကို စုစည်းသိမ်းဆည်းချိန်ဖြစ်သည်။ ညစဉ် ၇ မှ ၈ နာရီ ကောင်းမွန်စွာ အိပ်စက်ခြင်းက မှတ်ဉာဏ်စွမ်းရည်ကို ၄၀% တိုးတက်စေပါသည်။", author: "ကျန်းမာရေးနှင့် မှတ်ဉာဏ်", category: "study_tip" },
    { id: 54, quote: "စာမကျက်မီ ရေတစ်ဖန်ခွက် ကြိုတင်သောက်ထားခြင်းသည် ဦးနှောက်၏ အာရုံစူးစိုက်နိုင်စွမ်းကို ၁၄% ပိုမိုမြင့်မားစေပါသည်။", author: "ဦးနှောက် အာဟာရ", category: "study_tip" },
    { id: 55, quote: "Blurting Method (၁၅ မိနစ် စာပြန်နွှေးနည်း) - ၁၅ မိနစ် အချိန်သတ်မှတ်ပြီး မိမိမှတ်မိသော ဖော်မြူလာများနှင့် အဓိက သဘောတရားများကို စာရွက်ပေါ်တွင် အပြင်းအထန် ချရေးပါ။", author: "Revision နည်းလမ်း", category: "exam" },
    { id: 56, quote: "နာရီကို စိုက်ကြည့်မနေပါနဲ့၊ နာရီလုပ်သလို လုပ်ပါ။ ရှေ့ဆက်လျှောက်လှမ်းနေပါ။", author: "ဆမ် လီဗန်ဆန်", category: "motivation" },
    { id: 57, quote: "အောင်မြင်ခြင်း၏ လျှို့ဝှက်ချက်မှာ သာမန်အလုပ်များကို ထူးကဲကောင်းမွန်စွာ လုပ်ဆောင်ခြင်းပင် ဖြစ်သည်။", author: "ဂျွန် ဒီ ရော့ဖ်ဖယ်လာ", category: "discipline" },
    { id: 58, quote: "အလွန်အကျွံ ဖြစ်စရာမလိုပါ၊ မှန်မှန်ကန်ကန် ဆက်တိုက်လုပ်ဆောင်သွားရန်သာ အဓိကဖြစ်သည်။", author: "အမည်မသိ", category: "discipline" },
    { id: 59, quote: "လက်တွေ့လှုပ်ရှားမှုသည် အမြဲတမ်း ပျော်ရွှင်မှုကို မဆောင်ကြဉ်းပေးနိုင်သော်လည်း၊ လှုပ်ရှားမှုမရှိဘဲ ပျော်ရွှင်မှုဟူ၍ မရှိနိုင်ပါ။", author: "ဝီလျံ ဂျိမ်းစ်", category: "motivation" },
    { id: 60, quote: "ကောင်းစွာပြောခြင်းထက် ကောင်းစွာလုပ်ဆောင်ခြင်းက ပို၍တန်ဖိုးရှိသည်။", author: "ဘင်ဂျမင် ဖရန်ကလင်", category: "discipline" },
    { id: 61, quote: "တန်ဖိုးရှိသော နေရာတိုင်းသို့ သွားရောက်ရန် အလွယ်လမ်းဟူ၍ မရှိပါ။", author: "ဘီဗာလီ ਸિલ્ස්", category: "motivation" },
    { id: 62, quote: "ခုနစ်ကြိမ်လဲရင် ရှစ်ကြိမ်ထပါ။", author: "ဂျပန် စကားပုံ", category: "mindset" },
    { id: 63, quote: "သင် လိုချင်သမျှ အရာအားလုံးသည် ကြောက်ရွံ့ခြင်း၏ တစ်ဖက်ခြမ်းတွင် တည်ရှိနေသည်။", author: "ဂျော့ချ် အက်ဒါ", category: "mindset" },
    { id: 64, quote: "အခွင့်အရေးများသည် များသောအားဖြင့် ကြိုးစားအားထုတ်မှုဆိုသည့် ဝတ်စုံကို ဝတ်ဆင်ထားကြသည်။", author: "အန် လန်းဒါစ်", category: "discipline" },
    { id: 65, quote: "တောင်ကို ရွှေ့လိုသူသည် ကျောက်ခဲငယ်များကို စတင်သယ်ဆောင်ခြင်းဖြင့် စတင်ရသည်။", author: "ကွန်ဖြူးရှပ်", category: "motivation" },
    { id: 66, quote: "သင့်တွင်ရှိသောအရာ၊ သင်ရောက်ရှိနေသည့်နေရာမှစ၍ တတ်နိုင်သမျှ လုပ်ဆောင်ပါ။", author: "သီအိုဒို ရူးစဗဲ့", category: "motivation" },
    { id: 67, quote: "ပညာရှာဖွေခြင်းသည် ဦးနှောက်ကို ဘယ်တော့မှ ပင်ပန်းနွမ်းနယ်စေ지 않습니다.", author: "လီယိုနာဒို ဒါ ဗင်ချီ", category: "study_tip" },
    { id: 68, quote: "ပညာသင်ယူခြင်း၏ အလှတရားမှာ မည်သူကမျှ သင့်ထံမှ ၎င်းကို လုယူမသွားနိုင်ခြင်းပင် ဖြစ်သည်။", author: "ဘီဘီ ကင်း", category: "study_tip" },
    { id: 69, quote: "ပညာရေးဆိုသည်မှာ အချက်အလက်များကို အလွတ်ကျက်မှတ်ခြင်းမဟုတ်ဘဲ၊ စဉ်းစားတွေးခေါ်တတ်ရန် ဦးနှောက်ကို လေ့ကျင့်ပေးခြင်း ဖြစ်သည်။", author: "အဲလ်ဘတ် အိုင်းစတိုင်း", category: "study_tip" },
    { id: 70, quote: "အမှား ဘယ်တော့မှ မလုပ်ဖူးသူသည် အသစ်အဆန်းကို ဘယ်တော့မှ မစမ်းသပ်ဖူးသူ ဖြစ်သည်။", author: "အဲလ်ဘတ် အိုင်းစတိုင်း", category: "mindset" },
    { id: 71, quote: "အောင်မြင်မှုသည် အောင်မြင်မှုကို ရှာဖွေရန်ပင် အချိန်မရှိလောက်အောင် အလုပ်များနေသူများထံသို့ အရောက်လာတတ်သည်။", author: "ဟင်ရီ ဒေးဗစ် သိုရိုး", category: "discipline" },
    { id: 72, quote: "သင့်မျက်နှာကို နေရောင်ခြည်ဘက်သို့ လှည့်ထားပါ၊ သို့ဆိုလျှင် သင် အမှောင်ရိပ်ကို မြင်တွေ့ရတော့မည် မဟုတ်ပါ။", author: "ဟယ်လင် ကယ်လာ", category: "mindset" },
    { id: 73, quote: "ရည်မှန်းချက်အသစ် ချမှတ်ရန် သို့မဟုတ် အိပ်မက်အသစ် မက်ရန်အတွက် သင် အိုလွန်းသည်ဟူ၍ မရှိပါ။", author: "စီအက်စ် လူးဝစ်", category: "motivation" },
    { id: 74, quote: "သင့်ဘဝတွင် 'အမြဲတမ်း' နှင့် 'ဘယ်တော့မှ' ဆိုသော စကားလုံးများကို လျှော့ချပါ။", author: "အေမီ ပိုလာ", category: "mindset" },
    { id: 75, quote: "အကောင်းဆုံး လက်စားချေမှုမှာ ကြီးမားသော အောင်မြင်မှုကို ရယူပြခြင်းပင် ဖြစ်သည်။", author: "ဖရန့်ခ် စිනاتြာ", category: "motivation" },
    { id: 76, quote: "ဇွဲလုံ့လဆိုသည်မှာ ပြိုင်ပွဲရှည်ကြီးတစ်ခု မဟုတ်ပါ၊ တစ်ခုပြီးတစ်ခု ဆက်တိုက်ပြေးရသည့် ပြိုင်ပွဲငယ်များစွာ ဖြစ်သည်။", author: "ဝေါတာ အဲလိယော့", category: "discipline" },
    { id: 77, quote: "အခက်အခဲများ၏ အလယ်ဗဟိုတွင် အခွင့်အရေးများ ကိန်းအောင်းနေသည်။", author: "အဲလ်ဘတ် အိုင်းစတိုင်း", category: "mindset" },
    { id: 78, quote: "သင့်လက်ရှိအခြေအနေ၊ သင့်တွင်ရှိသမျှ အရာနှင့်စတင်ပါ၊ အဘယ်ကြောင့်ဆိုသော် သင့်တွင် ရှိပြီးသားအရာက လုံလောက်နေပြီဖြစ်သောကြောင့်တည်း။", author: "ခရစ် ဂါဒ်နာ", category: "motivation" },
    { id: 79, quote: "မနေ့က ဖြစ်ပျက်ခဲ့တာတွေအတွက် ဒီနေ့ရဲ့ အချိန်အများကြီးကို မပေးလိုက်ပါနဲ့။", author: "ဝီል ရိုဂျာ့စ်", category: "mindset" },
    { id: 80, quote: "ကျွန်ုပ်တို့၏ အမှောင်ဆုံး အချိန်နာရီများတွင်သာ အလင်းရောင်ကို တွေ့မြင်နိုင်ရန် အာရုံစိုက်ရမည် ဖြစ်သည်။", author: "အရစ္စတိုတယ်", category: "mindset" },
    { id: 81, quote: "ပညာရေးသည် ကမ္ဘာကြီးကို ပြောင်းလဲစေနိုင်သည့် အာဏာအရှိဆုံး လက်နက်ဖြစ်သည်။", author: "နယ်လ်ဆင် မန်ဒဲလား", category: "motivation" },
    { id: 82, quote: "သင် မြင်တွေ့လိုသော အပြောင်းအလဲကို သင့်ကိုယ်တိုင် စတင်ဖန်တီးပါ။", author: "မဟတ္တမ ဂန္ဒီ", category: "mindset" },
    { id: 83, quote: "စရိုက်တွင်ဖြစ်စေ၊ အပြုအမူတွင်ဖြစ်စေ၊ ပုံစံတွင်ဖြစ်စေ အမြင့်မားဆုံးသော ဂုဏ်ရည်မှာ ရိုးရှင်းခြင်းပင် ဖြစ်သည်။", author: "ဟင်နရီ ဝင်စဝิร์သ လောင်းဂ်ဖယ်လို", category: "discipline" },
    { id: 84, quote: "ငါ့ကိုပြောပြပါ၊ ငါမေ့သွားလိမ့်မယ်။ ငါ့ကိုသင်ပြပါ၊ ငါမှတ်မိလိမ့်မယ်။ ငါ့ကိုပါဝင်စေပါ၊ ငါတတ်မြောက်သွားလိမ့်မယ်။", author: "ဘင်ဂျမင် ဖရန်ကလင်", category: "study_tip" },
    { id: 85, quote: "ဆင်ခြင်သုံးသပ်ခြင်းမရှိသော ဘဝသည် ရှင်သန်ရန် မတန်ပေ။", author: "ဆိုခရာတီး (Socrates)", category: "mindset" },
    { id: 86, quote: "သိရုံဖြင့် မလုံလောက်ပါ၊ လက်တွေ့ကျင့်သုံးရမည်။ ကြိုးစားချင်ရုံဖြင့် မလုံလောက်ပါ၊ အမှန်တကယ် လုပ်ဆောင်ရမည်။", author: "ဂေါသဲ (Goethe)", category: "discipline" },
    { id: 87, quote: "ဘဝဆိုသည်မှာ အခြားအစီအစဉ်များ ဆွဲနေစဉ်အတွင်း သင့်တွင် ဖြစ်ပျက်သွားသည့် အရာများပင် ဖြစ်သည်။", author: "ဂျွန် လင်နွန်", category: "mindset" },
    { id: 88, quote: "သင်သွားလေရာရာ၌ မေတ္တာကို ဖြန့်ဝေပါ။ မည်သူမဆို သင့်ထံမှ ထွက်သွားသည့်အခါ ပို၍ပျော်ရွှင်သွားပါစေ။", author: "အမေ တီရီဇာ", category: "motivation" },
    { id: 89, quote: "ကြိုးအဆုံးသို့ ရောက်သွားပြီဆိုလျှင် အဖုလေးတစ်ခုချည်ပြီး ဆက်၍ ဆွဲထားပါ။", author: "ဖရန်ကလင် ဒီ ရူးစဗဲ့", category: "motivation" },
    { id: 90, quote: "ဂုဏ်သိက္ခာနှင့် သင့်လျော်သော ဆုံးဖြတ်ချက်မှအပ မည်သည့်အခါမျှ အရှုံးမပေးပါနှင့်။", author: "ဝင်းစတန် ချာချီ", category: "discipline" },
    { id: 91, quote: "ရိုးရှင်းခြင်းသည် အမြင့်မားဆုံးသော ခေတ်မီဆန်းပြားမှု ဖြစ်သည်။", author: "လီယိုနာဒို ဒါ ဗင်ချီ", category: "mindset" },
    { id: 92, quote: "သင့်အတွေးများကို ပြောင်းလဲပါ၊ သို့ဆိုလျှင် သင့်ကမ္ဘာကြီး ပြောင်းလဲသွားပါလိမ့်မည်။", author: "နော်မန် ဗින්စင့် ပီးလ်", category: "mindset" },
    { id: 93, quote: "အနာဂတ်သည် မိမိတို့အိပ်မက်များ၏ အလှတရားကို ယုံကြည်သူများအတွက် ဖြစ်သည်။", author: "အလီနོར་ ရူးစဗဲ့", category: "motivation" },
    { id: 94, quote: "လူများကို အပြစ်တင်နေမည်ဆိုပါက ၎င်းတို့ကို ချစ်ခင်ရန် သင့်တွင် အချိန်ရှိမည်မဟုတ်ပါ။", author: "အမေ တီရီဇာ", category: "mindset" },
    { id: 95, quote: "သင့်ကိုယ်ကို ထိန်းချုပ်ရန် ဦးနှောက်ကိုသုံးပါ၊ သူတစ်ပါးကို ဆက်ဆံရန် နှလုံးသားကိုသုံးပါ။", author: "အလီနོར་ ရူးစဗဲ့", category: "discipline" },
    { id: 96, quote: "ပျော်ရွှင်မှုဆိုသည်မှာ အသင့်ပါလာသည့် အရာမဟုတ်ပါ။ သင့်ကိုယ်ပိုင် လုပ်ရပ်များမှ ဖြစ်ပေါ်လာခြင်း ဖြစ်သည်။", author: "ဒလိုင်း လားမား", category: "mindset" },
    { id: 97, quote: "ငြိမ်းချမ်းရေးသည် အတွင်းစိတ်မှ လာသည်။ အပြင်ဘက်တွင် သွား၍ မရှာပါနှင့်။", author: "ဗုဒ္ဓမြတ်စွာဘုရား", category: "mindset" },
    { id: 98, quote: "မလုပ်ဆောင်ရသေးသမျှ ကာလပတ်လုံး မည်သည့်အရာမဆို မဖြစ်နိုင်ဟု ထင်ရစမြဲ ဖြစ်သည်။", author: "နယ်လ်ဆင် မန်ဒဲလား", category: "motivation" },
    { id: 99, quote: "ကျရှုံးခြင်းဆိုသည်မှာ တစ်ဖန်ပြန်လည်စတင်ရန် အခွင့်အရေးတစ်ခုသာဖြစ်ပြီး၊ ယခုတစ်ကြိမ်တွင် ပိုမိုထက်မြက်စွာ စတင်နိုင်မည်ဖြစ်သည်။", author: "ဟင်ရီ ဖို့ဒ်", category: "mindset" },
    { id: 100, quote: "အရည်အသွေးကောင်း ဆိုသည်မှာ တစ်ကြိမ်တခါ လုပ်ဆောင်ခြင်းမဟုတ်၊ အလေ့အကျင့်တစ်ခု ဖြစ်သည်။", author: "အရစ္စတိုတယ်", category: "discipline" },
    { id: 101, quote: "သင့်ကို အခြားတစ်ယောက်ဖြစ်လာစေရန် အမြဲကြိုးစားနေသော ကမ္ဘာကြီးထဲတွင် သင့်ကိုယ်သင် အစစ်အမှန်ဖြစ်နေခြင်းသည် အကြီးမားဆုံး အောင်မြင်မှု ဖြစ်သည်။", author: "ရဲဖ် ဝေါလ်ဒို အီမာဆန်", category: "mindset" },
    { id: 102, quote: "ဘဝ၏ တန်ဖိုးသည် သက်တမ်းရှည်ခြင်းမဟုတ်ဘဲ၊ ဘဝ၏ အနက်ရှိုင်းဆုံး အတွေ့အကြုံများ ဖြစ်သည်။", author: "ရဲဖ် ဝေါလ်ဒို အီမာဆန်", category: "mindset" },
    { id: 103, quote: "သင်လုပ်ဆောင်သမျှသည် အပြောင်းအလဲတစ်ခု ဖြစ်စေသကဲ့သို့ ပြုမူပါ။ အမှန်တကယ်လည်း ဖြစ်စေသည်။", author: "ဝီလျံ ဂျိမ်းစ်", category: "motivation" },
    { id: 104, quote: "အောင်မြင်မှုဆိုသည်မှာ စိတ်အားထက်သန်မှု မပျက်ဘဲ ကျရှုံးမှုတစ်ခုမှ အခြားတစ်ခုသို့ လျှောက်လှမ်းခြင်း ဖြစ်သည်။", author: "ဝင်းစတန် ချာချီ", category: "motivation" },
    { id: 105, quote: "မိမိကိုယ်ကို သိရှိခြင်းသည် ပညာဉာဏ်အားလုံး၏ အစပင် ဖြစ်သည်။", author: "အရစ္စတိုတယ်", category: "mindset" },
    { id: 106, quote: "မိုင်ပေါင်းများစွာ ရှည်လျားသော ခရီးသည် ပထမဆုံး ခြေလှမ်းတစ်လှမ်းမှ စတင်သည်။", author: "လာအိုဇီ (Lao Tzu)", category: "motivation" },
    { id: 107, quote: "ကျွန်ုပ်တို့ကို မသေစေနိုင်သော အရာသည် ကျွန်ုပ်တို့ကို ပိုမိုသန်မာစေသည်။", author: "ဖရီဒရစ် နიცရှေ", category: "mindset" },
    { id: 108, quote: "ဘဝဆိုသည်မှာ သင့်ထံသို့ ကျရောက်လာသည့်အရာ ၁၀ ရာခိုင်နှုန်းနှင့် သင် တုံ့ပြန်ပုံ ၉၀ ရာခိုင်နှုန်းတို့ ပေါင်းစပ်မှု ဖြစ်သည်။", author: "ချားလ်စ် ဆွင်ဒေါ", category: "mindset" },
    { id: 109, quote: "ပညာဗဟုသုတအတွက် ရင်းနှီးမြှုပ်နှံမှုသည် အကောင်းဆုံး အတိုးနှုန်းကို ပေးစမြဲ ဖြစ်သည်။", author: "ဘင်ဂျမင် ဖရန်ကလင်", category: "study_tip" },
    { id: 110, quote: "စူးစမ်းလိုစိတ်သည် ပညာသင်ယူခြင်း ဖယောင်းတိုင်၏ မီးစာ ဖြစ်သည်။", author: "ဝီလျံ အာသာ ဝေါ့ဒ်", category: "study_tip" },
    { id: 111, quote: "ယနေ့ပင် သင့်ဘဝကို ပြောင်းလဲပါ။ အနာဂတ်အတွက် လောင်းကြေးမထပ်ပါနှင့်၊ ယခုပင် နှောင့်နှေးခြင်းမရှိဘဲ လုပ်ဆောင်ပါ။", author: "ဆီမွန် ဒီ ဘီဗัว", category: "discipline" },
    { id: 112, quote: "ကျွန်ုပ်တို့ ထပ်တလဲလဲ လုပ်ဆောင်နေသော အရာသည် ကျွန်ုပ်တို့ပင် ဖြစ်သည်။ ထို့ကြောင့် ထူးချွန်မှုသည် အပြုအမူမဟုတ်ဘဲ အလေ့အကျင့်တစ်ခု ဖြစ်သည်။", author: "ဝီလ် ဒူရန်", category: "discipline" },
    { id: 113, quote: "သံသယစိတ်သည် ကျရှုံးမှုထက် အိပ်မက်များကို ပိုမို သတ်ဖြတ်ပစ်တတ်သည်။", author: "ဆူဇီ ကက်ဆမ်", category: "mindset" },
    { id: 114, quote: "ရှင်သန်ရမည့် အကြောင်းရင်း (Why) တိကျခိုင်မာသူသည် မည်သည့်အခက်အခဲကိုမဆို ကျော်လွှားနိုင်မည် ဖြစ်သည်။", author: "ဖရီဒရစ် နიცရှေ", category: "motivation" },
    { id: 115, quote: "တိတ်ဆိတ်ငြိမ်သက်ခြင်းသည် ကြီးမားသော ခွန်အား၏ ရင်းမြစ်တစ်ခု ဖြစ်သည်။", author: "လာအိုဇီ", category: "discipline" },
    { id: 116, quote: "သင်ကိုယ်တိုင် မြင့်မားလိုလျှင် သူတစ်ပါးကို မြင့်မားအောင် ကူညီပေးပါ။", author: "ဘွတ်ကာ တီ ဝါရှင်တန်", category: "motivation" },
    { id: 117, quote: "ပျင်းရိငြီးငွေ့စွာ သေဆုံးရခြင်းထက် စိတ်အားထက်သန်စွာဖြင့် သေဆုံးရခြင်းကို ပို၍ နှစ်သက်သည်။", author: "ဗင်စင့် ဗန် ဂိုး", category: "motivation" },
    { id: 118, quote: "လမ်းရှိရာသို့ မသွားပါနှင့်၊ လမ်းမရှိရာသို့ သွား၍ သဲလွန်စ ချန်ထားခဲ့ပါ။", author: "ရဲဖ် ဝေါလ်ဒို အီမာဆန်", category: "motivation" },
    { id: 119, quote: "အနာဂတ်ကို ခန့်မှန်းရန် အကောင်းဆုံးနည်းလမ်းမှာ အနာဂတ်ကို ကိုယ်တိုင်ဖန်တီးခြင်း ဖြစ်သည်။", author: "ပီတာ ဒြပ်ကာ", category: "mindset" },
    { id: 120, quote: "မျက်နှာကို ကြယ်တာရာများဆီသို့ ဦးတည်ထားပြီး ခြေဖဝါးကို မြေပြင်ပေါ်တွင် ခိုင်ခိုင်ထူထားပါ။", author: "သီအိုဒို ရူးစဗဲ့", category: "physics_wisdom" },
    { id: 121, quote: "ပညာဉာဏ်၏ အစသည် အံ့သြအံ့သြဖွယ်ဖြစ်ခြင်းမှ စတင်သည်။", author: "ဆိုခရာတီး", category: "study_tip" },
    { id: 122, quote: "ငါ့ကိုပြောပြပါ မေ့သွားလိမ့်မည်၊ ငါ့ကိုသင်ပြပါ မှတ်မိနိုင်မည်၊ ငါ့ကိုပါဝင်စေပါ တတ်မြောက်သွားလိမ့်မယ်။", author: "ရှုကွမ်း", category: "study_tip" },
    { id: 123, quote: "လက်တွေ့လုပ်ဆောင်မှုသည် ဉာဏ်ရည်ဉာဏ်သွေး၏ စစ်မှန်သော တိုင်းတာချက် ဖြစ်သည်။", author: "နပိုလီယံ ဟေးလ်", category: "discipline" },
    { id: 124, quote: "ရှေ့သို့ရောက်ရန် လျှို့ဝှက်ချက်မှာ စတင်လိုက်ခြင်းပင် ဖြစ်သည်။", author: "မာ့ခ် တွိန်း", category: "motivation" },
    { id: 125, quote: "အောင်မြင်ရန်အတွက် သင်၏ အောင်မြင်လိုစိတ်သည် ကျရှုံးမည်ကို ကြောက်ရွံ့ခြင်းထက် ကြီးမားရမည်။", author: "ဘီလ် ကိုစဘီ", category: "motivation" },
    { id: 126, quote: "အခွင့်အရေးဆိုသည်မှာ စောင့်ဆိုင်းနေရုံဖြင့် ပေါ်မလာပါ၊ သင်၏ စေတနာနှင့် ကြိုးစားအားထုတ်မှုဖြင့် ဖန်တီးယူရမည် ဖြစ်သည်။", author: "ခရစ် ဂရော့ဆာ", category: "workplace" },
    { id: 127, quote: "အလုပ်ခွင်တွင် ထက်မြက်အောင်မြင်ခြင်းဆိုသည်မှာ ကျွမ်းကျင်မှုသက်သက် မဟုတ်ဘဲ၊ စဉ်ဆက်မပြတ် တိုးတက်လိုသော စိတ်ဓာတ် (Continuous Growth Mindset) ဖြစ်သည်။", author: "ရဲဖ် မားစတန်", category: "workplace" },
    { id: 128, quote: "တိတ်ဆိတ်စွာ အစွမ်းကုန် ကြိုးစားပါ၊ သင်၏ အလုပ်ခွင် အောင်မြင်မှုများကိုသာ စကရင်ထက်တွင် အသံကျယ်ကျယ် ပျံ့လွင့်ပါစေ။", author: "ဖရန့်ခ် အိုရှန်း", category: "workplace" },
    { id: 129, quote: "အလုပ်ခွင်တွင် အချိန်ကို ရေတွက်မနေပါနှင့်၊ ရရှိသောအချိန်တိုင်းကို တန်ဖိုးရှိသော ရလဒ်ဖြစ်အောင် ဖန်တီးပါ။", author: "မူဟာမက် အလီ", category: "workplace" },
    { id: 130, quote: "ခေါင်းဆောင်ကောင်းဆိုသည်မှာ အမိန့်ပေးခိုင်းစေသူ မဟုတ်ဘဲ၊ မိမိအဖွဲ့ဝင်များ အောင်မြင်လာစေရန် ကူညီပံ့ပိုးပေးသူ ဖြစ်သည်။", author: "ဆိုင်းမွန် ဆိန်းနက်ခ်", category: "workplace" },
    { id: 131, quote: "ဦးနှောက်၏ အာရုံစိုက်နိုင်စွမ်းသည် မိနစ် ၂၅ အကြာတွင် အမြင့်ဆုံးသို့ ရောက်ရှိပြီးနောက် မောပန်းမှု စတင်လာသောကြောင့် Pomodoro နည်းလမ်းသည် အထိရောက်ဆုံး ဖြစ်ရခြင်း ဖြစ်သည်။", author: "ဦးနှောက်နှင့် အာရုံကြော သိပ္ပံ", category: "knowledge" },
    { id: 132, quote: "ညမအိပ်မီ စာလေ့လာခြင်း သို့မဟုတ် ဗဟုသုတ ဖတ်ရှုခြင်းသည် REM အိပ်စက်ချိန်တွင် ဦးနှောက် Hippocampus မှ မှတ်ဉာဏ်များကို ရေရှည်မှတ်ဉာဏ်အဖြစ် ပိုမိုခိုင်မာစွာ သိမ်းဆည်းပေးသည်။", author: "အိပ်စက်ခြင်းဆိုင်ရာ ဗဟုသုတ", category: "knowledge" },
    { id: 133, quote: "ဖိုင်းမန်း နည်းလမ်း (Feynman Technique) - မည်သည့် ရှုပ်ထွေးသော သဘောတရားကိုမဆို ၁၀ နှစ်အရွယ် ကလေးတစ်ယောက် နားလည်အောင် ရိုးရှင်းစွာ ရှင်းပြမပြနိုင်သေးပါက ထိုအကြောင်းအရာကို သင် အပြည့်အဝ နားမလည်သေးပေ။", author: "ရစ်ချတ် ဖိုင်းမန်း (နိုဘယ်ဆုရှင်)", category: "knowledge" },
    { id: 134, quote: "ဇိုင်ဂါနစ် အကျိုးသက်ရောက်မှု (Zeigarnik Effect) အရ ဦးနှောက်သည် ပြီးစီးသွားသောအလုပ်များထက် မပြီးသေးဘဲ တဝက်တပျက် ကျန်နေသောအလုပ်များကို ပိုမို သတိရမှတ်မိနေလေ့ရှိသည်။", author: "စိတ်ပညာ ဗဟုသုတ", category: "knowledge" },
    { id: 135, quote: "မနက်နိုးနိုးချင်း ရေတစ်ဖန်ခွက် (၂၅၀ ml) သောက်သုံးခြင်းသည် ခန္ဓာကိုယ်၏ စွမ်းအင်လောင်ကျွမ်းမှုကို ၂၄% မြှင့်တင်ပေးပြီး ဦးနှောက်ကြည်လင်မှုကို ချက်ချင်း ရရှိစေသည်။", author: "ကျန်းမာရေး အသိပညာ", category: "knowledge" },
    { id: 136, quote: "၂၀-၂၀-၂၀ စည်းမျဉ်း - စကရင်ကို ၂၀ မိနစ် ကြည့်ပြီးတိုင်း ပေ ၂၀ အကွာရှိ အရာတစ်ခုခုကို စက္ကန့် ၂၀ ကြည့်ပေးခြင်းဖြင့် မျက်စိညောင်းညာမှုကို ထိရောက်စွာ ကာကွယ်နိုင်သည်။", author: "မျက်စိ ကျန်းမာရေး", category: "knowledge" },
    { id: 137, quote: "စာကြည့်ပြီးနောက် ၁၀ မိနစ်ခန့် လမ်းလျှောက်ခြင်း သို့မဟုတ် ပေါ့ပေါ့ပါးပါး လေ့ကျင့်ခန်းလုပ်ခြင်းသည် ဦးနှောက်ဆဲလ်များ ဖွံ့ဖြိုးမှုကို မြှင့်တင်ပေးသော BDNF ဓာတ်ကို ထုတ်ပေးသည်။", author: "ဇီဝဗေဒ ဗဟုသုတ", category: "knowledge" },
    { id: 138, quote: "အကွာအဝေးခြား လေ့လာခြင်း (Spaced Repetition) - ၁ ရက်၊ ၃ ရက်၊ ၇ ရက်ခြားပြီး ပြန်နွှေးခြင်းသည် စာမေးပွဲနီးမှ ကမန်းကတန်း ကျက်ခြင်းထက် မှတ်ဉာဏ်ထိန်းသိမ်းမှုကို ၂၀၀% ပိုမို မြှင့်တင်ပေးသည်။", author: "သင်ယူမှု သိပညာ", category: "knowledge" },
    { id: 139, quote: "မိမိကိုယ်ကို ပြန်လည်မေးခွန်းထုတ် စစ်ဆေးခြင်း (Active Recall) သည် စာအုပ်ကို ထပ်ခါထပ်ခါ ဖတ်နေခြင်းထက် ဦးနှောက်နျူရွန် လမ်းကြောင်းများကို ပိုမို အားကောင်းစေသည်။", author: "ပညာရေး စိတ်ပညာ", category: "knowledge" },
    { id: 140, quote: "ပါရီတို စည်းမျဉ်း (၈၀/၂၀ Rule) - သင်၏ အောင်မြင်မှုနှင့် ရလဒ် ၈၀% သည် သင် အာရုံစိုက်လုပ်ဆောင်သော ၂၀% သော အရေးကြီးအလုပ်များမှ လာခြင်းဖြစ်သည်။", author: "ဗီလ်ဖရီဒို ပါရီတို", category: "knowledge" },
    { id: 141, quote: "Neuroplasticity သဘောတရားအရ လူ့ဦးနှောက်သည် အသက်အရွယ်မရွေး အသိပညာအသစ်များကို လေ့လာနိုင်ပြီး ဆဲလ်ဖွဲ့စည်းပုံကို အစဉ်အမြဲ ပြောင်းလဲတိုးတက်စေနိုင်သည်။", author: "ဦးနှောက် သိပ္ပံ", category: "knowledge" },
    { id: 142, quote: "စာသားများနှင့် ပုံကြမ်း/စကားကားများ (Visual Diagrams) ကို တွဲဖက်မှတ်သားခြင်းသည် စာသားသက်သက် မှတ်ခြင်းထက် မှတ်ဉာဏ်ထဲတွင် ၂ ဆ ပိုမို စွဲထင်စေသည်။", author: "အလန် ပိုင်ဗီယို", category: "knowledge" },
    { id: 143, quote: "Blurting Method - အကြောင်းအရာတစ်ခုကို ၁၅ မိနစ်ဖတ်ပါ၊ စာအုပ်ပိတ်၍ မှတ်မိသမျှ ချရေးပါ၊ ထို့နောက် ကျန်ခဲ့သော အချက်များကို ပြန်လည်စစ်ဆေးပါ။", author: "စာကျက်နည်း ဗဟုသုတ", category: "knowledge" },
    { id: 144, quote: "ဖုန်းသတိပေးချက် သို့မဟုတ် အာရုံစိုက်မှု ပျက်ပြားသွားပါက ယခင် မူလ အာရုံစိုက်မှုအပြည့်အဝ ပြန်ရရန် ပျှမ်းမျှ ၂၃ မိနစ်ခန့် အချိန်ယူရသဖြင့် စာကျက်ချိန်တွင် ဖုန်းကို အဝေး၌ ထားသင့်သည်။", author: "သုတေသန လေ့လာချက်", category: "knowledge" },
    { id: 145, quote: "ပါကင်ဆန်၏ နိယာမ (Parkinson's Law) - အလုပ်တစ်ခုသည် သတ်မှတ်ထားသော အချိန်ကာလအတိုင်း ကြာမြင့်သွားတတ်သဖြင့် သီးသန့် အချိန်တို Deadline များ သတ်မှတ်ပါ၊ ပိုမို မြန်ဆန်ပါလိမ့်မည်။", author: "နော့သ်ကို့တ် ပါကင်ဆန်", category: "knowledge" },
    { id: 146, quote: "စိတ်ထဲက စိုးရိမ်ကြောက်ရွံ့မှုတွေနောက်ကို မလိုက်ပါနဲ့။ နှလုံးသားထဲက အိပ်မက်တွေနောက်ကိုသာ လျှောက်လှမ်းပါ။", author: "ရွိုင်း တီ ဘန်းနက်", category: "motivation" },
    { id: 147, quote: "မနက်ဖြန်အတွက် ကျွန်ုပ်တို့ ရရှိနိုင်မယ့် အခွင့်အလမ်းတွေရဲ့ တစ်ခုတည်းသော အတားအဆီးဟာ ယနေ့ရှိနေတဲ့ သံသယတွေပဲ ဖြစ်ပါတယ်။", author: "ဖရန်ကလင် ဒီ ရူးစဗဲ့", category: "motivation" },
    { id: 148, quote: "စာကျက်ချိန် သို့မဟုတ် အလုပ်လုပ်ချိန်တွင် ရေဓာတ်ပြည့်ဝနေခြင်းက စဉ်းစားနိုင်စွမ်းကို ထိန်းသိမ်းပေးသည်။ ၁% မျှသော ရေဓာတ်ခမ်းခြောက်မှုသည်ပင် စွမ်းဆောင်ရည်ကို ကျဆင်းစေနိုင်သည်။", author: "ကျန်းမာရေး သိပ္ပံ", category: "knowledge" },
    { id: 149, quote: "၄၅ မိနစ်ခန့် ထိုင်ပြီးတိုင်း ၂ မိနစ်ခန့် ကိုယ်လက်ဆန့်ထုတ်ပေးခြင်းသည် ဦးနှောက်ဆီသို့ သွေးလည်ပတ်မှုကို ကောင်းမွန်စေပြီး အာရုံစူးစိုက်မှုကို ပိုမိုမြင့်မားစေသည်။", author: "ခန္ဓာကိုယ်ကျန်းမာရေး ဗဟုသုတ", category: "knowledge" },
    { id: 150, quote: "မအိပ်မီ ၁ နာရီအလို ဖုန်းနှင့် ကွန်ပျူတာမှ အပြာရောင်အလင်း (Blue Light) ကို ရှောင်ရှားခြင်းက Melatonin ဟော်မုန်း ထုတ်လုပ်မှုကို ကောင်းမွန်စေပြီး နှစ်ခြိုက်စွာ အိပ်ပျော်စေပါသည်။", author: "အိပ်စက်ခြင်းဆိုင်ရာ သိပ္ပံ", category: "knowledge" },
    { id: 151, quote: "Pomodoro နည်းလမ်းသည် အချိန်ကို အကန့်အသတ်ဖြစ်စေသဖြင့် ဦးနှောက်၏ အချိန်ဆွဲလိုသော သဘာဝကို ကျော်လွှားကာ ပိုမိုအာရုံစိုက်လာစေသည်။", author: "အလုပ်လုပ်ပုံ ဗဟုသုတ", category: "knowledge" },
    { id: 152, quote: "သပ်ရပ်သန့်ရှင်းသော အလုပ်စားပွဲ သို့မဟုတ် စာကြည့်စားပွဲသည် စိတ်ဖိစီးမှုဟော်မုန်း (Cortisol) ကို ကျဆင်းစေပြီး အလုပ်လုပ်ရာတွင် စိတ်အေးချမ်းစေသည်။", author: "စိတ်ပညာဗဟုသုတ", category: "knowledge" },
    { id: 153, quote: "ထိရောက်သော ဆက်သွယ်ပြောဆိုမှုသည် ၇၀% နားထောင်ခြင်းနှင့် ၃၀% ပြောဆိုခြင်း ဖြစ်သည်။ တစ်ပါးသူကို နားလည်အောင် အရင်နားထောင်ပေးခြင်းက လုပ်ငန်းခွင် ဆက်ဆံရေးကို အားကောင်းစေသည်။", author: "လုပ်ငန်းခွင် စည်းကမ်းဗဟုသုတ", category: "workplace" },
    { id: 154, quote: "အစည်းအဝေးများသို့ ၅ မိနစ်ခန့် ကြိုတင်ရောက်ရှိခြင်းက စိတ်တည်ငြိမ်မှုရစေသည့်အပြင် လုပ်ဖော်ကိုင်ဖက်များ၏ အချိန်ကို လေးစားရာလည်း ရောက်သည်။", author: "လုပ်ငန်းခွင် ကျင့်ဝတ်စည်းကမ်း", category: "workplace" },
    { id: 155, quote: "မိမိမှားယွင်းမှုကို အပြည့်အဝတာဝန်ယူပြီး ပြင်ဆင်ရန် အကြံပြုချက်ကို တင်ပြခြင်းသည် လုပ်ငန်းခွင်တွင် ယုံကြည်ကိုးစားမှု တည်ဆောက်ရန် အမြန်ဆုံးနည်းလမ်းဖြစ်သည်။", author: "လုပ်ငန်းခွင် ဗဟုသုတ", category: "workplace" },
    { id: 156, quote: "တိုတက်လိုသော စိတ်ထား (Growth Mindset) ရှိသူသည် ဉာဏ်ရည်ဉာဏ်သွေးကို တိုးတက်အောင် လုပ်ယူနိုင်သည်ဟု ယုံကြည်သည်။ အခက်အခဲများကို ရှောင်ကွင်းရမည့်အရာမဟုတ်ဘဲ သင်ယူရမည့် အခွင့်အရေးအဖြစ် ရှုမြင်သည်။", author: "ကာရိုး ဒွက်ခ်", category: "mindset" },
    { id: 157, quote: "ကျေးဇူးတင်တတ်သောစိတ်သည် သင့်ဘဝတွင် လိုအပ်နေသောအရာများထက် ရှိပြီးသား ကောင်းမွန်သောအရာများကို ပိုမိုမြင်တွေ့စေသည်။ နေ့စဉ် ကျေးဇူးတင်စရာ ၃ ခုကို သတိပြုပါ။", author: "ထားရှိရမည့် စိတ်ထား", category: "mindset" },
    { id: 158, quote: "သင့်ဘဝရဲ့ ပထမဆုံးအခန်းကို သူတစ်ပါးရဲ့ အခန်း ၂၀ နဲ့ မနှိုင်းယှဉ်ပါနဲ့။ လူတိုင်းမှာ ကိုယ်ပိုင်အချိန်ဇယားနဲ့ ကိုယ်ပိုင်ခရီးစဉ် ရှိကြစမြဲပါ။", author: "ထားရှိရမည့် စိတ်ထား", category: "mindset" },
    { id: 159, quote: "သူတစ်ပါးကို ပြန်လည်သင်ကြားပေးခြင်းသည် အထိရောက်ဆုံးသော စာလေ့လာနည်းဖြစ်သည်။ ၎င်းက ဦးနှောက်ကို အချက်အလက်များအား အဆင့်ဆင့် စနစ်တကျ ပြန်လည်ဖွဲ့စည်းစေသည်။", author: "ပညာရေး သိပံ္ပ", category: "study_tip" },
    { id: 160, quote: "မည်သည့် ဘာသာရပ်ကိုမဆို ကျွမ်းကျင်စေရန် အပိုင်းငယ်လေးများ ခွဲခြားလေ့လာပါ။ ဦးနှောက်သည် ကြီးမားသော စာအုပ်ကြီးများထက် အပိုင်းငယ်များကို ပိုမိုလွယ်ကူစွာ မှတ်မိနိုင်သည်။", author: "ပညာရေး ဗဟုသုတ", category: "study_tip" },
    { id: 161, quote: "အိုမီဂါ-၃ (Omega-3) ပါဝင်မှုများသော အခွံမာသီးများနှင့် အစေ့အဆန်များကို စားသုံးခြင်းသည် ဦးနှောက်တည်ဆောက်ပုံကို ထောက်ပံ့ပေးပြီး မှတ်ဉာဏ်ထိန်းသိမ်းမှုကို မြှင့်တင်ပေးသည်။", author: "အာဟာရဗေဒ သိပ္ပံ", category: "knowledge" },
    { id: 162, quote: "ပညာရေးသည် ဘဝအတွက် ပြင်ဆင်ခြင်း မဟုတ်ပါ၊ ပညာရေးကိုယ်တိုင်ကသာ ဘဝစစ်စစ် ဖြစ်သည်။", author: "ဂျွန် ဒူဝီ", category: "study_tip" },
    { id: 163, quote: "စာမေးပွဲအောင်ရုံသက်သက်မဟုတ်ဘဲ ကျွမ်းကျင်တတ်မြောက်စေရန် သင်ယူပါ။ စစ်မှန်သောပညာရေးသည် စာမေးပွဲပြီးသွားသော်လည်း သင့်ထံတွင် အစဉ်အမြဲ ကျန်ရှိနေလိမ့်မည်။", author: "ပညာရေး လမ်းညွှန်", category: "study_tip" },
    { id: 164, quote: "အဖွဲ့ဝင်များအကြား ဗဟုသုတများကို လွတ်လပ်စွာ မျှဝေပါ။ အချက်အလက်များကို ဖုံးကွယ်ထားခြင်းက တိုးတက်မှုကို နှောင့်နှေးစေသည်။", author: "လုပ်ငန်းခွင် ဗဟုသုတ", category: "workplace" },
    { id: 165, quote: "အလုပ်လုပ်ချိန်တွင် ခန္ဓာကိုယ်အနေအထား (Posture) မှန်ကန်စေရန် စကရင်ကို မျက်လုံးအဆင့်တွင် ထားပါ။ ၎င်းက ရေရှည်ကျောရိုးပင်ပန်းမှုကို ကာကွယ်ပေးသည်။", author: "ကျန်းမာရေး ဗဟုသုတ", category: "knowledge" }
  ]
};

export const DAILY_QUIZZES: DailyQuiz[] = [
  {
    id: 1,
    question: {
      my: "ရစ်ချတ် ဖိုင်းမန်း (Richard Feynman) နည်းလမ်းအရ ရှုပ်ထွေးသော သဘောတရားတစ်ခုကို အမှန်တကယ် နားလည်ကြောင်း မည်သို့ သက်သေပြနိုင်သနည်း?",
      en: "According to the Feynman Technique, how can you prove you truly understand a concept?"
    },
    options: {
      my: [
        "၁၀ နှစ်အရွယ် ကလေးတစ်ယောက် နားလည်အောင် ရိုးရှင်းစွာ ရှင်းပြနိုင်ခြင်း",
        "စာအုပ်ထဲရှိ အဓိပ္ပာယ်ဖွင့်ဆိုချက်အတိုင်း အလွတ်ရွတ်ပြနိုင်ခြင်း",
        "အဆင့်မြင့် ခက်ခဲသော ဝေါဟာရများကို ထည့်သွင်းပြောဆိုနိုင်ခြင်း"
      ],
      en: [
        "Explain it simply so a 10-year-old child can understand",
        "Recite the textbook definition word-for-word from memory",
        "Use complex academic jargon to describe it"
      ]
    },
    correctIndex: 0,
    explanation: {
      my: "ဖိုင်းမန်း နည်းစနစ်၏ အနှစ်သာရမှာ မည်သည့် ခက်ခဲနက်နဲသော အရာကိုမဆို ရိုးရှင်းသော စကားလုံးများဖြင့် ကလေးတစ်ယောက် နားလည်အောင် ရှင်းပြနိုင်မှသာ ထိုအကြောင်းအရာကို အပြည့်အဝ နားလည်ခြင်း ဖြစ်သည်။",
      en: "The Feynman Technique proves mastery when you can strip away jargon and explain an idea simply enough for anyone to grasp."
    },
    category: "study_tip"
  },
  {
    id: 2,
    question: {
      my: "၂၀-၂၀-၂၀ စည်းမျဉ်းအရ စကရင်ကို ၂၀ မိနစ် ကြည့်ပြီးတိုင်း မျက်စိအနားရရန် ပေမည်မျှ အကွာကို စက္ကန့် ၂၀ ကြည့်ပေးရမည်နည်း?",
      en: "According to the 20-20-20 rule, how far should you look away for 20 seconds after 20 minutes of screen time?"
    },
    options: {
      my: ["ပေ ၂၀ အကွာ (20 Feet)", "ပေ ၅၀ အကွာ (50 Feet)", "ပေ ၁၀ အကွာ (10 Feet)"],
      en: ["20 feet away", "50 feet away", "10 feet away"]
    },
    correctIndex: 0,
    explanation: {
      my: "ပေ ၂၀ အကွာရှိ အရာတစ်ခုခုကို စက္ကန့် ၂၀ ကြာ ကြည့်ပေးခြင်းဖြင့် မျက်စိကြွက်သားများ တင်းကျပ်မှုကို ပြေလျော့စေပြီး မျက်စိညောင်းညာမှုကို ထိရောက်စွာ ကာကွယ်ပေးသည်။",
      en: "Looking 20 feet away relaxes the ciliary muscles in your eyes, preventing digital eye strain."
    },
    category: "knowledge"
  },
  {
    id: 3,
    question: {
      my: "ပါကင်ဆန်၏ နိယာမ (Parkinson's Law) ၏ အဓိက အနှစ်သာရမှာ အဘယ်နည်း?",
      en: "What is the core premise of Parkinson's Law?"
    },
    options: {
      my: [
        "အလုပ်တစ်ခုသည် သတ်မှတ်ထားသော အချိန်ကာလရှိသမျှ ကုန်လွန်ပြည့်လျှံသွားတတ်သည်",
        "အလုပ်များများလုပ်လေ ပိုမို အောင်မြင်လေဖြစ်သည်",
        "တစ်ပြိုင်နက်တည်း အလုပ်မျိုးစုံ လုပ်ခြင်းသည် ပို၍ မြန်ဆန်သည်"
      ],
      en: [
        "Work expands so as to fill the time available for its completion",
        "Doing more hours always guarantees higher success",
        "Multitasking finishes tasks much faster"
      ]
    },
    correctIndex: 0,
    explanation: {
      my: "အလုပ်တစ်ခုကို ပြီးရန် အချိန် ၁ ပတ်ပေးထားပါက ၁ ပတ်လုံး ကြာမြင့်သွားတတ်ပြီး ၁ ရက်သာ ပေးထားပါက ၁ ရက်အတွင်း ပြီးမြောက်တတ်သဖြင့် အချိန်တို Deadline သတ်မှတ်ခြင်းက အထောက်အကူပြုသည်။",
      en: "If you give yourself 2 weeks to finish an essay, it will take 2 weeks. Setting shorter, tighter milestones speeds up completion."
    },
    category: "discipline"
  },
  {
    id: 4,
    question: {
      my: "ဇိုင်ဂါနစ် အကျိုးသက်ရောက်မှု (Zeigarnik Effect) အရ ဦးနှောက်သည် မည်သည့်အရာများကို ပိုမို သတိရမှတ်မိနေလေ့ရှိသနည်း?",
      en: "According to the Zeigarnik Effect, what does our brain remember better?"
    },
    options: {
      my: [
        "ပြီးစီးသွားသောအလုပ်များထက် မပြီးသေးဘဲ ကျန်နေသောအလုပ်များ",
        "လွန်ခဲ့သော ၁ နှစ်က ပြီးစီးခဲ့သည့် စာမေးပွဲအဖြေများ",
        "နေ့စဉ် ပုံမှန် အလွယ်တကူ လုပ်နေကျ အလုပ်များ"
      ],
      en: [
        "Unfinished or interrupted tasks rather than completed ones",
        "Completed exams from years ago",
        "Routine daily habits that require no effort"
      ]
    },
    correctIndex: 0,
    explanation: {
      my: "အလုပ်တစ်ခု မပြီးသေးသရွေ့ ဦးနှောက်သည် ထိုအလုပ်ကို ဆက်လက်သတိရနေစေရန် စိတ်ပိုင်းဆိုင်ရာ တင်းမာမှု (cognitive tension) ကို ထိန်းသိမ်းထားသည်။",
      en: "Uncompleted tasks create cognitive tension, keeping them active in memory until finished."
    },
    category: "knowledge"
  },
  {
    id: 5,
    question: {
      my: "ပါရီတို စည်းမျဉ်း (Pareto Principle / 80-20 Rule) အရ သင့်ရလဒ် ၈၀% သည် သင့်လုပ်ဆောင်ချက် မည်မျှ ရာခိုင်နှုန်းမှ ထွက်ပေါ်လာသနည်း?",
      en: "Under the Pareto Principle (80/20 Rule), 80% of outcomes come from what percentage of causes?"
    },
    options: {
      my: ["၂၀% သော အရေးကြီးအလုပ်များမှ", "၅၀% သော ပုံမှန်အလုပ်များမှ", "၈၀% သော ကြိုးစားမှုများမှ"],
      en: ["20% of high-impact efforts", "50% of routine actions", "80% of total hours"]
    },
    correctIndex: 0,
    explanation: {
      my: "အရေးကြီးဆုံးသော ၂၀% သော လုပ်ငန်းဆောင်တာများကို ဦးစားပေး အာရုံစိုက်ခြင်းဖြင့် အကျိုးရလဒ် ၈၀% ကို အချိန်ကုန်သက်သာစွာ ရရှိနိုင်သည်။",
      en: "Focusing on the vital 20% of high-leverage tasks produces 80% of your meaningful results."
    },
    category: "mindset"
  },
  {
    id: 6,
    question: {
      my: "စာကျက်ရာတွင် မှတ်ဉာဏ်အကောင်းဆုံး ခိုင်မာစေသည့် နည်းလမ်းမှာ အဘယ်နည်း?",
      en: "Which study technique produces the strongest long-term retention?"
    },
    options: {
      my: [
        "စာအုပ်ပိတ်၍ မိမိဘာသာ ပြန်လည်မေးခွန်းထုတ် ဖြေဆိုခြင်း (Active Recall)",
        "စာအုပ်ကို စာမျက်နှာအလိုက် ထပ်ခါတလဲလဲ ဖတ်နေခြင်း (Passive Reading)",
        "စာသားများကို အရောင်စုံ Highlighter တားခြင်း"
      ],
      en: [
        "Testing yourself with the book closed (Active Recall)",
        "Passively re-reading the textbook multiple times",
        "Highlighting sentences in multiple bright colors"
      ]
    },
    correctIndex: 0,
    explanation: {
      my: "ဦးနှောက်ထဲမှ အချက်အလက်ကို ပြန်လည် ဆွဲထုတ်အသုံးပြုခြင်း (Retrieval Practice / Active Recall) သည် နျူရွန်လမ်းကြောင်းများကို အားအကောင်းဆုံး တည်ဆောက်ပေးသည်။",
      en: "Retrieval practice forces the brain to rebuild neural pathways, cementing memories much more than passive re-reading."
    },
    category: "study_tip"
  },
  {
    id: 7,
    question: {
      my: "စံသတ်မှတ်ထားသော ပိုမိုဒိုရို (Pomodoro) စာကျက်ချိန် ၁ ကြိမ်သည် မိနစ် မည်မျှကြာမြင့်သနည်း?",
      en: "What is the standard length of one classic Pomodoro focus sprint?"
    },
    options: {
      my: ["၂၅ မိနစ် စာကျက် + ၅ မိနစ် အနားယူ", "၄၅ မိနစ် စာကျက် + ၁၅ မိနစ် အနားယူ", "၆၀ မိနစ် စာကျက် မနားတမ်း"],
      en: ["25 minutes focus + 5 minutes break", "45 minutes focus + 15 minutes break", "60 minutes non-stop focus"]
    },
    correctIndex: 0,
    explanation: {
      my: "၂၅ မိနစ် အာရုံစူးစိုက်ပြီး ၅ မိနစ် အနားယူခြင်းသည် ဦးနှောက်ပင်ပန်းမှုကို ကာကွယ်ပေးပြီး အာရုံစိုက်မှုကို နာရီပေါင်းများစွာ ကြာရှည် ထိန်းထားနိုင်သည်။",
      en: "25 minutes of high-intensity focus paired with a 5-minute break prevents mental fatigue and maintains cognitive stamina."
    },
    category: "discipline"
  },
  {
    id: 8,
    question: {
      my: "မနက်နိုးနိုးချင်း ရေတစ်ဖန်ခွက် (၂၅၀ ml) သောက်ခြင်းသည် ခန္ဓာကိုယ် ဇီဝကမ္မဖြစ်စဉ်နှင့် စွမ်းအင်လောင်ကျွမ်းမှုကို မည်မျှ ရာခိုင်နှုန်း မြှင့်တင်ပေးသနည်း?",
      en: "Drinking a glass of water first thing in the morning boosts metabolic rate by approximately how much?"
    },
    options: {
      my: ["၂၄% ခန့် (Approximately 24%)", "၅% ခန့် (Approximately 5%)", "၅၀% ခန့် (Approximately 50%)"],
      en: ["Around 24%", "Around 5%", "Around 50%"]
    },
    correctIndex: 0,
    explanation: {
      my: "ညဘက် ၇ နာရီမှ ၈ နာရီကြာ ရေဓာတ်ခန်းခြောက်နေသော ဦးနှောက်ဆဲလ်များကို ချက်ချင်း နိုးကြားစေပြီး ဇီဝကမ္မဖြစ်စဉ်ကို ၂၄% ခန့် လျင်မြန်စေသည်။",
      en: "Hydration after hours of sleep re-activates cellular metabolism and rapidly clears morning brain fog."
    },
    category: "knowledge"
  },
  {
    id: 9,
    question: {
      my: "စာကျက်ပြီးနောက် ၁၀ မိနစ်ခန့် လမ်းလျှောက်ခြင်း သို့မဟုတ် လေ့ကျင့်ခန်းလုပ်ခြင်းသည် ဦးနှောက်တွင် မည်သည့် ဓာတ်ပစ္စည်း ထွက်ရှိမှုကို အားပေးသနည်း?",
      en: "Taking a light 10-minute walk after studying triggers the release of which neurotrophic factor?"
    },
    options: {
      my: ["ဦးနှောက်ဆဲလ်များ ကြီးထွားစေသော BDNF", "အိပ်ငိုက်စေသော Melatonin", "ဖိစီးမှု ဟော်မုန်း Cortisol"],
      en: ["Brain-Derived Neurotrophic Factor (BDNF)", "Sleep-inducing Melatonin", "Stress-producing Cortisol"]
    },
    correctIndex: 0,
    explanation: {
      my: "ပေါ့ပါးသော လှုပ်ရှားမှုသည် BDNF ဓာတ်ကို ထုတ်ပေးပြီး သင်ယူထားသော အသစ်အဆန်းများကို ရေရှည်မှတ်ဉာဏ်အဖြစ် ကူးပြောင်းရာတွင် အထောက်အကူပြုသည်။",
      en: "Physical movement stimulates BDNF, which supports synaptic plasticity and long-term memory consolidation."
    },
    category: "knowledge"
  },
  {
    id: 10,
    question: {
      my: "Neuroplasticity သဘောတရားအရ လူ့ဦးနှောက်နှင့် ပတ်သက်၍ အမှန်ကန်ဆုံး အချက်မှာ အဘယ်နည်း?",
      en: "What is the key scientific truth revealed by Neuroplasticity?"
    },
    options: {
      my: [
        "လူ့ဦးနှောက်သည် အသက်အရွယ်မရွေး လေ့လာမှုအသစ်များဖြင့် ဖွဲ့စည်းပုံကို အမြဲပြောင်းလဲတိုးတက်စေနိုင်သည်",
        "လူ့ဦးနှောက်သည် အသက် ၂၀ ကျော်ပါက အသစ်သင်ယူနိုင်စွမ်း လုံးဝရပ်တန့်သွားသည်",
        "မွေးရာပါ ဉာဏ်ရည်သည် ဘယ်တော့မှ ပြောင်းလဲတိုးတက်၍ မရနိုင်ပါ"
      ],
      en: [
        "The brain can reorganize synaptic pathways and grow at any age through dedicated learning",
        "The brain loses all ability to learn after age 20",
        "Intelligence is fixed at birth and cannot be cultivated"
      ]
    },
    correctIndex: 0,
    explanation: {
      my: "Neuroplasticity အရ မည်သည့်အသက်အရွယ်တွင်မဆို အလေ့အကျင့်အသစ်၊ ပညာအသစ်များကို လေ့ကျင့်ပေးပါက ဦးနှောက်နျူရွန်ဆဲလ်များသည် ချိတ်ဆက်မှုအသစ်များ အမြဲတစေ ပြုလုပ်နိုင်သည်။",
      en: "Neuroplasticity proves that the human brain continuously adapts, rewires, and grows stronger through effort and deliberate practice throughout life."
    },
    category: "mindset"
  }
];

export function getCurrentTimeSlot(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
}

export function detectQuoteMicroAction(quote: DailyQuote): MicroActionInfo | null {
  if (!quote || !quote.quote) return null;
  const qText = quote.quote.toLowerCase();

  if (quote.actionType === 'eye_timer' || qText.includes('၂၀-၂၀-၂၀') || qText.includes('မျက်စိ') || qText.includes('20-20-20') || qText.includes('eye strain')) {
    return {
      type: 'eye_timer',
      title: { my: '👁️ ၂၀ စက္ကန့် မျက်စိအနားပေးမည်', en: '👁️ 20-Sec Eye Rest Timer' },
      description: { my: 'ပေ ၂၀ အကွာရှိ အရာတစ်ခုခုကို စက္ကန့် ၂၀ ကြာ ကြည့်ပေးပါ', en: 'Look at an object 20 feet away for 20 seconds' },
      duration: 20,
      iconName: 'Eye'
    };
  }

  if (quote.actionType === 'drink_water' || qText.includes('ရေတစ်ဖန်ခွက်') || qText.includes('ရေသောက်') || qText.includes('water') || qText.includes('hydration')) {
    return {
      type: 'drink_water',
      title: { my: '💧 ရေတစ်ဖန်ခွက် သောက်ပြီးပါပြီ', en: '💧 Log Water Glass' },
      description: { my: 'ဦးနှောက်နှင့် ခန္ဓာကိုယ် ဇီဝကမ္မဖြစ်စဉ်ကို လန်းဆန်းစေရန် ရေသောက်ပါ', en: 'Rehydrate your brain and body for peak focus' },
      iconName: 'Droplet'
    };
  }

  if (quote.actionType === 'deep_breath' || qText.includes('အသက်ရှူ') || qText.includes('စိတ်ဖိစီး') || qText.includes('အပန်းဖြေ') || qText.includes('deep breath') || qText.includes('stress')) {
    return {
      type: 'deep_breath',
      title: { my: '🫁 ၄-၇-၈ အသက်ရှူ လေ့ကျင့်ခန်း', en: '🫁 4-7-8 Breathing Exercise' },
      description: { my: 'စိတ်ဖိစီးမှု လျှော့ချရန် ညင်သာစွာ အသက်ရှူသွင်း/ထိန်း/ထုတ်ပါ', en: 'Inhale 4s, hold 7s, exhale 8s to calm the mind' },
      duration: 60,
      iconName: 'Wind'
    };
  }

  if (quote.actionType === 'focus_25' || qText.includes('ပိုမိုဒိုရို') || qText.includes('pomodoro') || qText.includes('အာရုံစိုက်') || qText.includes('၂၅ မိနစ်') || qText.includes('focus') || qText.includes('parkinson') || qText.includes('ပါကင်ဆန်') || qText.includes('blurting') || qText.includes('feynman') || qText.includes('ဖိုင်းမန်း')) {
    return {
      type: 'focus_25',
      title: { my: '🎯 ၁၅ မိနစ် Focus Timer စတင်မည်', en: '🎯 Start 15-Min Focus Sprint' },
      description: { my: 'အာရုံနှောင့်ယှက်မှု ကင်းစွာ ၁၅ မိနစ် စာကျက်/အလုပ်လုပ်ပါ', en: 'Silence distractions and sprint for 15 minutes' },
      duration: 15 * 60,
      iconName: 'Target'
    };
  }

  return null;
}

export function getSubjectSmartTip(subjectName: string, lang: 'my' | 'en'): DailyQuote | null {
  if (!subjectName) return null;
  const lower = subjectName.toLowerCase();
  const list = MOTIVATIONAL_QUOTES[lang] || MOTIVATIONAL_QUOTES.en;

  // Science / Physics / Chemistry / Bio
  if (lower.includes('physic') || lower.includes('ရူပ') || lower.includes('chem') || lower.includes('ဓာတု') || lower.includes('bio') || lower.includes('ဇီဝ') || lower.includes('sci')) {
    return list.find(q => q.category === 'physics_wisdom' || q.id === 133 || q.id === 141) || list[33];
  }
  // Math / Calculation / Logic
  if (lower.includes('math') || lower.includes('သင်္ချာ') || lower.includes('calc') || lower.includes('alg')) {
    return list.find(q => q.id === 133 || q.id === 140 || q.id === 139) || list[34];
  }
  // Language / English / Myanmar
  if (lower.includes('eng') || lower.includes('အင်္ဂလိပ်') || lower.includes('myan') || lower.includes('မြန်မာ') || lower.includes('lang')) {
    return list.find(q => q.id === 138 || q.id === 142 || q.id === 143) || list[27];
  }
  // Exam / Test
  if (lower.includes('exam') || lower.includes('test') || lower.includes('စာမေးပွဲ') || lower.includes('quiz')) {
    return list.find(q => q.category === 'exam') || list[44];
  }
  return null;
}

export function getDailyQuiz(dayOffset = 0): DailyQuiz {
  const now = new Date();
  const startYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const index = Math.abs((dayOfYear + dayOffset) % DAILY_QUIZZES.length);
  return DAILY_QUIZZES[index];
}

export function getDailyQuote(
  lang: 'my' | 'en',
  manualOffset = 0,
  categoryFilter?: string,
  timeFilter?: 'all' | 'morning' | 'afternoon' | 'evening',
  customQuotes: DailyQuote[] = []
): DailyQuote {
  const now = new Date();
  const startYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  let list = [...(MOTIVATIONAL_QUOTES[lang] || MOTIVATIONAL_QUOTES.en)];
  if (customQuotes && customQuotes.length > 0) {
    list = [...customQuotes, ...list];
  }

  if (categoryFilter && categoryFilter !== 'all') {
    if (categoryFilter === 'custom') {
      const customs = list.filter(q => q.isCustom || q.category === 'custom');
      if (customs.length > 0) return customs[Math.abs(manualOffset % customs.length)];
    } else {
      const filtered = list.filter(q => q.category === categoryFilter);
      if (filtered.length > 0) list = filtered;
    }
  }

  // Time-aware filtering if requested
  if (timeFilter && timeFilter !== 'all') {
    let timeMatched: DailyQuote[] = [];
    if (timeFilter === 'morning') {
      timeMatched = list.filter(q => q.id === 135 || q.id === 1 || q.id === 13 || q.id === 30 || q.id === 140 || q.category === 'motivation');
    } else if (timeFilter === 'afternoon') {
      timeMatched = list.filter(q => q.id === 136 || q.id === 144 || q.id === 145 || q.id === 5 || q.category === 'study_tip' || q.category === 'discipline');
    } else if (timeFilter === 'evening') {
      timeMatched = list.filter(q => q.id === 132 || q.id === 137 || q.id === 138 || q.category === 'mindset' || q.category === 'physics_wisdom');
    }
    if (timeMatched.length > 0) list = timeMatched;
  }

  const index = Math.abs((dayOfYear + manualOffset) % list.length);
  return list[index];
}

export function getRandomQuote(lang: 'my' | 'en', categoryFilter?: string, customQuotes: DailyQuote[] = []): DailyQuote {
  let list = [...(MOTIVATIONAL_QUOTES[lang] || MOTIVATIONAL_QUOTES.en)];
  if (customQuotes && customQuotes.length > 0) {
    list = [...customQuotes, ...list];
  }
  if (categoryFilter && categoryFilter !== 'all') {
    const filtered = list.filter(q => q.category === categoryFilter);
    if (filtered.length > 0) list = filtered;
  }
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}
