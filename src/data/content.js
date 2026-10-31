// Journal: 10 courses x 20 items (words and sentences), rising from small to high difficulty.
// Courses 1-5 are Beginner, 6-10 are Advanced. Each item is spoken once, then typed.
// Courses: 5 paragraph courses. Courses 1-2 are about 100 words (Beginner), 3-5 about 200 words (Advanced).

export const JOURNAL = [
  {
    id: 'j1', kind: 'journal', title: 'Starter Words', level: 'Beginner', timeSec: 240,
    items: ['cat', 'book', 'water', 'happy', 'I am happy.', 'She has a pen.', 'We eat rice.', 'The sun is hot.', 'I have two bags.', 'He likes green tea.',
      'They play football after school.', 'My brother reads the newspaper.', 'Please close the door behind you.', 'We usually walk to the market.', 'I forgot my umbrella at home.',
      'Our class starts at nine o\'clock.', 'She works in a small bakery.', 'It rained all day yesterday.', 'Can you help me with this bag?', 'I am learning English every day.'],
  },
  {
    id: 'j2', kind: 'journal', title: 'Simple Sentences', level: 'Beginner', timeSec: 240,
    items: ['garden', 'window', 'breakfast', 'quickly', 'We went to the park.', 'My phone is on the table.', 'Birds sing in the morning.', 'She cooks dinner every night.',
      'The store closes at eight.', 'He walked to school today.', 'I need a new pair of shoes.', 'The train was late again.', 'We watched a movie last night.',
      'My sister likes to draw flowers.', 'Please write your name on top.', 'The weather is cool and windy.', 'They bought fresh vegetables at the market.',
      'I will call you when I reach home.', 'Could you show me the way to the station?', 'Practice makes a person perfect over time.'],
  },
  {
    id: 'j3', kind: 'journal', title: 'Everyday Life', level: 'Beginner', timeSec: 240,
    items: ['journey', 'important', 'interesting', 'comfortable', 'I want to travel abroad someday.', 'She is studying for her final exams.', 'Our teacher explained the lesson clearly.',
      'He forgot to bring his notebook again.', 'We should save money for emergencies.', 'The meeting has been moved to Monday.', 'Reading every day improves your vocabulary.',
      'They decided to repair the old bicycle.', 'I usually drink a glass of water after waking up.', 'The children were excited about the picnic.',
      'Please remember to lock the gate before leaving.', 'My friend recommended a very good restaurant.', 'Learning a new language takes patience and time.',
      'The store is offering a discount on winter clothes.', 'If it stops raining, we will go for a walk.', 'Good communication helps teams solve problems faster.'],
  },
  {
    id: 'j4', kind: 'journal', title: 'Daily Routine', level: 'Beginner', timeSec: 240,
    items: ['schedule', 'necessary', 'available', 'gradually', 'The bus leaves the station at half past six.', 'She has been working here for three years.',
      'I could not find my keys this morning.', 'We need to finish the report by Friday.', 'Our neighbours invited us to their wedding.', 'He is good at solving math problems.',
      'The river looks beautiful during the sunset.', 'If you practise daily, your speed will improve.', 'The doctor advised him to rest for a week.',
      'They have already sent the invitation by email.', 'It is necessary to drink water during summer.', 'She prefers reading short stories before bed.',
      'The company will announce the results next month.', 'Although it was raining, the match continued.', 'I would like to book a table for two people.',
      'Consistent effort usually leads to steady improvement.'],
  },
  {
    id: 'j5', kind: 'journal', title: 'Clear Basics', level: 'Beginner', timeSec: 240,
    items: ['opportunity', 'experience', 'responsibility', 'surprisingly', 'The team completed the project ahead of schedule.', 'She has never missed a single class this semester.',
      'We were disappointed that the event was cancelled.', 'He apologised for arriving late to the meeting.', 'Applying for a job requires a clear and honest resume.',
      'Nobody expected such a dramatic change in the weather.', 'The manager asked everyone to share their feedback.', 'I have been trying to learn guitar for two years.',
      'Despite the heavy traffic, we reached the airport on time.', 'Writing a daily journal can help you reflect on your progress.', 'Would you mind explaining that again more slowly, please?',
      'The new policy will take effect at the beginning of next year.', 'Good habits are built slowly through small and consistent actions.',
      'She was confident that her presentation would impress the judges.', 'If we had planned better, we would not have missed the train.',
      'Learning to type quickly is useful for almost every profession.'],
  },
  {
    id: 'j11', kind: 'journal', title: 'Warm-Up Words', level: 'Beginner', timeSec: 300,
    items: ['sun', 'tree', 'milk', 'paper', 'bread', 'green', 'table', 'river', 'house', 'apple', 'I like apples.', 'The cup is full.', 'We sing a song.', 'My bag is blue.', 'He runs very fast.', 'The door is open.', 'Birds fly in the sky.', 'She reads one book.', 'The cat sleeps on a chair.', 'Let us go outside now.'],
  },
  {
    id: 'j12', kind: 'journal', title: 'Everyday Phrases', level: 'Beginner', timeSec: 300,
    items: ['morning', 'evening', 'friend', 'lunch', 'market', 'window', 'pencil', 'garden', 'kitchen', 'rain', 'Good morning, how are you?', 'Thank you for your help.', 'I will be there soon.', 'Please sit down here.', 'What time is it now?', 'We are going to the beach.', 'My phone battery is low.', 'Can I have some water?', 'I love cooking on Sundays.', 'Take care and have a nice day.'],
  },
  {
    id: 'j6', kind: 'journal', title: 'Vocabulary Builders', level: 'Advanced', timeSec: 360,
    items: ['perseverance', 'meticulous', 'ambiguous', 'approximately', 'Consequently, the committee postponed its decision until further notice.', 'Although he was exhausted, he continued studying until midnight.',
      'The analysis revealed a significant correlation between sleep and productivity.', 'She articulated her arguments with remarkable clarity and confidence.',
      'Environmental regulations have become increasingly stringent over the past decade.', 'Their proposal, although ambitious, lacked a realistic financial plan.',
      'By the time we arrived, most of the guests had already left.', 'The scientist\'s findings challenged several long-standing assumptions.',
      'Rather than complaining about the problem, she proposed a practical solution.', 'The software update introduced several improvements to security and performance.',
      'Unless the government intervenes, the crisis may deepen considerably.', 'He spent years refining his techniques before publishing his first book.',
      'The novel explores themes of identity, memory, and belonging.', 'Had we known about the delay, we would have adjusted our itinerary.',
      'Effective leaders listen carefully before making decisions that affect others.', 'The results were statistically significant, though the sample size was small.'],
  },
  {
    id: 'j7', kind: 'journal', title: 'Resilience and Growth', level: 'Advanced', timeSec: 360,
    items: ['resilience', 'hypothesis', 'inevitable', 'unprecedented', 'The hypothesis was tested under strictly controlled conditions.', 'Her eloquence made even the most skeptical listeners pay attention.',
      'Economic growth slowed considerably after the global supply disruptions.', 'Not only did the team meet the deadline, but they also exceeded expectations.',
      'The archaeologists uncovered artifacts that dated back several thousand years.', 'He underestimated how quickly public opinion could shift during the campaign.',
      'Notwithstanding the criticism, the director stood firmly by her original vision.', 'Proper hydration, adequate sleep, and regular exercise support long-term health.',
      'The committee\'s recommendations were widely debated but rarely implemented.', 'Such unprecedented collaboration between rival companies surprised many analysts.',
      'Had the warning been taken seriously, the damage could have been avoided.', 'The author\'s prose is dense, yet it rewards patient and attentive reading.',
      'Recent advances in machine learning have transformed how data is interpreted.', 'Her decision, though controversial, reflected a deep commitment to fairness.',
      'Only after months of rigorous testing did the engineers approve the design.', 'Ethical considerations must be weighed alongside technical feasibility at every stage.'],
  },
  {
    id: 'j8', kind: 'journal', title: 'Pragmatic Thinking', level: 'Advanced', timeSec: 360,
    items: ['pragmatic', 'nuance', 'deteriorate', 'disproportionate', 'The policy\'s unintended consequences emerged gradually over several years.', 'He tends to overanalyse minor details, which delays his final decisions.',
      'Few people anticipated how profoundly the technology would reshape daily life.', 'The negotiations stalled because neither side was willing to compromise.',
      'Her essay examines the tension between individual freedom and collective responsibility.', 'Without adequate funding, the research programme could quickly lose momentum.',
      'The share price fluctuated wildly in response to conflicting economic reports.', 'Scarcity, rather than abundance, often drives people to make rash decisions.',
      'The museum\'s collection offers a compelling overview of colonial-era trade routes.', 'Critics argued that the reforms disproportionately benefited wealthy urban districts.',
      'Were the evidence more conclusive, the court might have reached a different verdict.', 'Efficient communication requires clarity of purpose, precision of language, and mutual trust.',
      'The climate models predicted gradual warming, but the observed changes were far more abrupt.', 'His mentor\'s advice, though initially uncomfortable, proved invaluable in the long run.',
      'Under mounting pressure, the board reconsidered its controversial acquisition strategy.', 'Successful organisations adapt their strategies without abandoning their core values.'],
  },
  {
    id: 'j9', kind: 'journal', title: 'Modern Business', level: 'Advanced', timeSec: 360,
    items: ['entrepreneur', 'benevolent', 'indisputable', 'incongruous', 'The entrepreneur reinvested nearly every dollar of profit into research.', 'Rarely have financial markets reacted so swiftly to a single announcement.',
      'The ambiguity of the contract left room for considerable legal interpretation.', 'Despite its modest budget, the film achieved remarkable critical acclaim.',
      'Scientists are increasingly concerned about the long-term effects of microplastics.', 'Had the investors been more cautious, the losses might have been contained.',
      'The city\'s transport network struggles to accommodate its rapidly growing population.', 'Her meticulous documentation made the audit remarkably straightforward.',
      'It is indisputable that sustained practice refines both skill and judgment.', 'The incongruous blend of ancient architecture and modern design fascinated visitors.',
      'Although the evidence was circumstantial, the prosecutor pursued the case vigorously.', 'Innovation thrives where curiosity is encouraged and failure is treated as feedback.',
      'The benevolent foundation distributes grants to community-led education projects.', 'Few observers foresaw how quickly the regional conflict would escalate into a crisis.',
      'Not until the final audit did the discrepancies in the accounts come to light.', 'Sustainable growth depends on balancing economic ambition with ecological responsibility.'],
  },
  {
    id: 'j10', kind: 'journal', title: 'Mastery Sentences', level: 'Advanced', timeSec: 360,
    items: ['quintessential', 'idiosyncratic', 'juxtaposition', 'ubiquitous', 'The novel\'s quintessential theme is the search for meaning in ordinary life.', 'Her idiosyncratic writing style divides critics but captivates a devoted readership.',
      'The juxtaposition of silence and noise intensified the film\'s emotional impact.', 'Smartphones have become ubiquitous, subtly reshaping how people concentrate and communicate.',
      'Were it not for his persistent objections, the proposal would have passed unnoticed.', 'The diplomat\'s measured response defused a situation that had threatened to escalate.',
      'Scholars continue to debate whether economic inequality is a cause or a consequence of instability.', 'The painting\'s chiaroscuro effects create a dramatic tension between light and shadow.',
      'Only by interrogating our assumptions can we arrive at genuinely original insights.', 'The committee\'s verdict, though contentious, was upheld after an exhaustive appeal.',
      'Her research bridges neuroscience and linguistics in ways few contemporaries have attempted.', 'The sheer volume of data overwhelmed the team\'s existing infrastructure.',
      'Rhetorical sophistication, rather than mere volume, distinguished his most memorable speeches.', 'Had the regulators acted sooner, the crisis might have been averted altogether.',
      'The enigmatic author deliberately withholds information, compelling readers to infer meaning.', 'Ultimately, the measure of a civilisation lies in how it treats its most vulnerable members.'],
  },
];

export const COURSES = [
  {
    id: 'p1', kind: 'course', title: 'Morning Routine', level: 'Beginner', timeSec: 300,
    items: ['Every morning I wake up at seven and drink a glass of water. Then I brush my teeth, make my bed, and open the window to let fresh air into the room. After that, I eat a simple breakfast with fruit and toast. I like to read a few pages of a short book before I start my work. Small routines help me feel calm and ready for the day. When I follow them, I finish my tasks on time and feel proud of myself. On weekends I wake up a little later, but I still drink water first and take a short walk around the block.'],
  },
  {
    id: 'p2', kind: 'course', title: 'Market Day', level: 'Beginner', timeSec: 300,
    items: ['My friend Ravi and I went to the local market last Sunday. We wanted to buy vegetables, bread, and some fresh juice for the week. The market was crowded, so we walked slowly and looked carefully at every stall. The fruit seller offered us a sweet mango, and we tasted it before paying. At the end of the day, we returned home tired but happy. It was a simple trip, yet we both enjoyed every moment of it. Next time we plan to visit earlier, when the vegetables are fresher and the crowd is smaller.'],
  },
  {
    id: 'p6', kind: 'course', title: 'Weekend Walk', level: 'Beginner', timeSec: 420,
    items: ['On Saturday morning I wake up early and open the window. The air is fresh and the sky is blue. I put on my old shoes and walk to the small park near my house. There are many trees, and some children are playing with a red ball. I sit on a wooden bench and drink a cup of tea. A dog runs past me and wags its tail. After one hour I walk back home, eat a warm breakfast, and feel happy and relaxed.'],
  },
  {
    id: 'p7', kind: 'course', title: 'A Visit to the Library', level: 'Beginner', timeSec: 420,
    items: ['The public library is on the corner of our street. It opens at nine in the morning and closes at six in the evening. Inside, the room is quiet and bright. People read books, write notes, or use the computers. My friend Ravi likes history books, but I prefer stories about animals. Every Friday I borrow two new books and return the old ones. The librarian is kind and always helps me find what I need. I think a library is one of the best places to learn.'],
  },
  {
    id: 'p8', kind: 'course', title: 'Cooking Rice at Home', level: 'Beginner', timeSec: 420,
    items: ['Cooking rice is simple once you know the steps. First, wash the rice two or three times in cold water. Next, put one cup of rice and two cups of water in a pot. Add a small pinch of salt and bring it to a boil. Then lower the heat, cover the pot, and let it cook for about fifteen minutes. When the water is gone, turn off the stove and wait five minutes. Fluff the rice gently with a spoon and serve it hot with dal and vegetables.'],
  },
  {
    id: 'p3', kind: 'course', title: 'The Art of Typing', level: 'Advanced', timeSec: 480,
    items: ['Learning to type quickly is more than a technical skill; it is a habit that shapes how we think and communicate. When your fingers move without hesitation, your mind can focus on ideas instead of keys. Beginners often look down at the keyboard and lose their rhythm, but with patient practice the hands gradually learn the layout. Accuracy matters just as much as speed. A fast typist who makes many mistakes spends extra time correcting them, while a steady typist who writes carefully often finishes sooner. The best way to improve is to practise a little every day, to notice recurring errors, and to slow down when a particular combination of letters causes trouble. Many professionals keep a short routine: five minutes of warm-up drills, twenty minutes of focused practice, and a brief review of what went wrong. Over several months, these small sessions add up to a noticeable change. Typing also becomes calmer, because you stop fighting the keyboard and start expressing yourself naturally. Whether you write emails, reports, or personal notes, this quiet skill saves time, reduces frustration, and helps your words arrive on the screen exactly as you intended them to.'],
  },
  {
    id: 'p4', kind: 'course', title: 'Money and Markets', level: 'Advanced', timeSec: 480,
    items: ['Economic decisions rarely depend on a single factor. Households weigh income, expenses, and uncertainty, while companies balance costs, competition, and the expectations of investors. When interest rates rise, borrowing becomes more expensive, and many families postpone large purchases such as houses or cars. Businesses respond by delaying expansion or by seeking efficiencies that protect their margins. Yet the consequences are not uniform. Some industries thrive in a tighter environment because their customers remain committed, whereas others struggle as demand weakens. Policymakers therefore face a difficult trade-off: a restrictive stance may control inflation, but it can also slow employment and investment. Economists disagree about how quickly these effects unfold and how strongly they persist. What most agree upon is that clear communication matters. When markets understand the reasoning behind a policy, they tend to react more calmly, and sudden swings become less likely. Ordinary citizens benefit from this clarity too, since predictable conditions make it easier to plan savings, study for careers, and invest in long-term goals with confidence. Teachers, doctors, and small shop owners all feel these changes in their daily work, which is why the news about interest rates is discussed so widely in every town.'],
  },
  {
    id: 'p5', kind: 'course', title: 'Science in Practice', level: 'Advanced', timeSec: 480,
    items: ['Scientific progress often begins with an observation that seems unremarkable at first. A researcher notices that a particular bacterium fails to grow near a certain fungus, or that a pattern in satellite data repeats each spring. Curiosity transforms that small anomaly into a question, and the question into a testable hypothesis. Designing a good experiment requires more than enthusiasm. Controls must be chosen carefully, variables isolated, and measurements repeated until the results are reliable. Even then, findings remain provisional, because later studies may reveal conditions that the original work did not consider. Peer review offers a valuable check, although it cannot eliminate every error or bias. Replication is perhaps the strongest safeguard, since independent teams testing the same claim can confirm or challenge it. Science is therefore a collective enterprise, built slowly through disagreement, revision, and patient accumulation of evidence. Its authority comes not from certainty but from a disciplined willingness to be wrong and to correct course when the evidence demands it. Students who learn this habit early tend to ask better questions, read critically, and treat new claims with healthy patience rather than blind belief or automatic doubt.'],
  },
];

export const ALL_COURSES = [...JOURNAL, ...COURSES];
export const courseById = (id) => ALL_COURSES.find((c) => c.id === id);
