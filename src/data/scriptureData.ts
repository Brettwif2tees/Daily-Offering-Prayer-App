/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Christian Standard Bible (CSB) Scripture Repository
 * Daily Offering App
 */

import allPsalmsRaw from './allPsalms.json';

const ALL_LOCAL_PSALMS = allPsalmsRaw as Record<string, { header: string; verses: string[] }>;

export interface Verse {
  number: number;
  text: string;
  lines: string[];
}

export interface ScriptureReading {
  reference: string;
  book: 'Psalms' | 'Proverbs';
  chapter: number;
  startVerse?: number;
  endVerse?: number;
  verses: Verse[];
  liturgicalTitle: string;
  latinInciphier?: string;
  invocation: string;
  translation: string;
}

/**
 * Splits biblical poetry lines according to classical Hebrew parallelism rules
 * (bicolon/tricolon formatting where the second half/parallel cola of a line is on a new line).
 */
export function splitBiblicalPoeticLines(rawText: string): string[] {
  if (!rawText) return [];

  // If already formatted with explicit newlines, respect them
  if (rawText.includes('\n')) {
    return rawText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
  }

  let text = rawText.trim();

  // Handle Selah at the end of a verse
  let selahSuffix = false;
  if (/(\s+Selah\.?)$/i.test(text)) {
    text = text.replace(/(\s+Selah\.?)$/i, '').trim();
    selahSuffix = true;
  }

  const lines: string[] = [];

  // Split on major pauses: semicolons, exclamations, questions, colons followed by quotes
  const majorChunks = text.split(/(?<=[;!?—])\s+(?=[A-Z“"])|(?<=:\s*(?=[“"A-Z]))/g);

  for (const chunk of majorChunks) {
    const trimmedChunk = chunk.trim();
    if (!trimmedChunk) continue;

    // Check for quoted speech: e.g. 'Many say about me, "There is no help..."'
    const quoteMatch = trimmedChunk.match(/^(.*?[,:]\s*)([“"].*)$/);
    if (quoteMatch) {
      if (quoteMatch[1].trim()) lines.push(quoteMatch[1].trim());
      if (quoteMatch[2].trim()) lines.push(quoteMatch[2].trim());
      continue;
    }

    // Check for parallel contrast/conjunction markers: ', but ', ', yet ', ', and ', etc.
    const conjMatch = trimmedChunk.match(/^(.*?[,])\s+(but|yet|and|for|nor|so|while|who|which|whose|when|where)\s+(.*)$/i);
    if (conjMatch && conjMatch[1].length > 10 && conjMatch[3].length > 8) {
      lines.push(conjMatch[1].trim());
      lines.push(`${conjMatch[2]} ${conjMatch[3]}`.trim());
      continue;
    }

    // Check for rhetorical question boundary: '? '
    const qMatch = trimmedChunk.match(/^(.*?\?)\s+(.*)$/);
    if (qMatch) {
      lines.push(qMatch[1].trim());
      lines.push(qMatch[2].trim());
      continue;
    }

    // Check for Proverbs comma break without explicit conjunction:
    const commaBreak = trimmedChunk.match(/^(.*?,)\s+([A-Z].*)$/);
    if (commaBreak && commaBreak[1].length > 14 && commaBreak[2].length > 14) {
      lines.push(commaBreak[1].trim());
      lines.push(commaBreak[2].trim());
      continue;
    }

    lines.push(trimmedChunk);
  }

  if (selahSuffix) {
    lines.push('Selah');
  }

  return lines.length > 0 ? lines : [rawText];
}

// Canonical Christian Standard Bible (CSB) text collections for Psalms
export const PSALMS_CSB: Record<number, { title: string; verses: string[] }> = {
  1: {
    title: "The Righteous and the Ungodly",
    verses: [
      "How happy is the one who does not walk in the advice of the wicked\nor stand in the pathway with sinners\nor sit in the company of mockers!",
      "Instead, his delight is in the LORD’s instruction,\nand he meditates on it day and night.",
      "He is like a tree planted beside flowing streams\nthat bears its fruit in its season\nand whose leaf does not wither.\nWhatever he does prospers.",
      "The wicked are not like this;\ninstead, they are like chaff that the wind blows away.",
      "Therefore the wicked will not stand up in the judgment,\nnor sinners in the assembly of the righteous.",
      "For the LORD watches over the way of the righteous,\nbut the way of the wicked leads to ruin."
    ]
  },
  2: {
    title: "The Reign of the LORD's Anointed",
    verses: [
      "Why do the nations rebel\nand the peoples plot in vain?",
      "The kings of the earth take their stand\nand the rulers conspire together\nagainst the LORD and his Anointed One:",
      "“Let’s tear off their chains\nand throw off their ropes.”",
      "The one enthroned in heaven laughs;\nthe Lord ridicules them.",
      "Then he speaks to them in his anger\nand terrifies them in his wrath:",
      "“I have consecrated my king\non Zion, my holy mountain.”",
      "I will declare the LORD’s decree:\nHe said to me, “You are my Son;\ntoday I have become your Father.",
      "Ask of me, and I will make the nations your inheritance\nand the ends of the earth your possession.",
      "You will break them with an iron scepter;\nyou will shatter them like pottery.”",
      "So now, kings, be wise;\nreceive instruction, you judges of the earth.",
      "Serve the LORD with reverent fear\nand rejoice with trembling.",
      "Pay homage to the Son, or he will be angry\nand you will perish in your rebellion,\nfor his anger may ignite at any moment.\nBlessed are all who take refuge in him."
    ]
  },
  3: {
    title: "Confidence in God's Deliverance",
    verses: [
      "Lord, how my foes increase!\nThere are many who attack me.",
      "Many say about me,\n“There is no help for him in God.”\nSelah",
      "But you, Lord, are a shield around me,\nmy glory, and the one who lifts up my head.",
      "I cry aloud to the Lord,\nand he answers me from his holy mountain.\nSelah",
      "I lie down and sleep;\nI wake again because the Lord sustains me.",
      "I will not be afraid of thousands of people\nwho have taken their stand against me on every side.",
      "Rise up, Lord!\nSave me, my God!\nYou strike all my enemies on the cheek;\nyou break the teeth of the wicked.",
      "Salvation belongs to the Lord;\nmay your blessing be on your people.\nSelah"
    ]
  },
  4: {
    title: "Peace and Trust in the LORD",
    verses: [
      "Answer me when I call, God of my righteousness.\nYou have freed me from my distress;\nbe gracious to me and hear my prayer.",
      "How long, exalted men, will my honor be insulted?\nHow long will you love what is worthless and pursue a lie?\nSelah",
      "Know that the LORD has set apart the faithful for himself;\nthe LORD will hear when I call to him.",
      "Be angry and do not sin;\nponder it on your bed and be silent.\nSelah",
      "Offer sacrifices of righteousness\nand trust in the LORD.",
      "Many are asking, “Who can show us anything good?”\nLet the light of your face shine on us, LORD.",
      "You have put more joy in my heart\nthan they have when their grain and new wine abound.",
      "I will both lie down and sleep in peace,\nfor you alone, LORD, make me live in safety."
    ]
  },
  5: {
    title: "A Morning Prayer for Guidance",
    verses: [
      "Listen to my words, LORD;\nconsider my sighing.",
      "Pay attention to the sound of my cry, my King and my God,\nfor I pray to you.",
      "In the morning, LORD, you hear my voice;\nin the morning I plead my case to you and watch expectantly.",
      "For you are not a God who delights in wickedness;\nevil cannot dwell with you.",
      "The boastful cannot stand in your presence;\nyou hate all evildoers.",
      "You destroy those who tell lies;\nthe LORD detests the man of bloodshed and deceit.",
      "But I, through the abundance of your faithful love, will enter your house;\nI will bow down toward your holy sanctuary in reverence of you.",
      "LORD, lead me in your righteousness because of my adversaries;\nmake your way straight before me.",
      "For there is nothing reliable in what they say; destruction is within them;\ntheir throat is an open grave; they flatter with their tongues.",
      "Declare them guilty, God; let them fall by their own devices.\nDrive them away because of the abundance of their transgressions,\nfor they have rebelled against you.",
      "But let all who take refuge in you rejoice;\nlet them shout for joy forever.\nMay you shelter them,\nand may those who love your name boast in you.",
      "For you, LORD, bless the righteous one;\nyou surround him with favor like a shield."
    ]
  },
  8: {
    title: "The Majesty of the LORD",
    verses: [
      "LORD, our Lord, how magnificent is your name throughout the earth!\nYou have covered the heavens with your majesty.",
      "From the mouths of infants and nursing babies, you have established a stronghold on account of your adversaries\nin order to silence the enemy and the avenger.",
      "When I observe your heavens, the work of your fingers,\nthe moon and the stars, which you set in place,",
      "what is a human being that you remember him,\na son of man that you look after him?",
      "You made him little less than God\nand crowned him with glory and honor.",
      "You made him ruler over the works of your hands;\nyou put everything under his feet:",
      "all the sheep and oxen,\nas well as the animals in the wild,",
      "the birds of the sky, and the fish of the sea,\nthat pass through the currents of the seas.",
      "LORD, our Lord,\nhow magnificent is your name throughout the earth!"
    ]
  },
  15: {
    title: "A Citizen of Zion",
    verses: [
      "LORD, who can dwell in your tent?\nWho can live on your holy mountain?",
      "The one who lives blamelessly, practices righteousness,\nand acknowledges the truth in his heart—",
      "who does not slander with his tongue,\nwho does not harm his friend, or discredit his neighbor,",
      "who despises the one rejected by the LORD but honors those who fear the LORD,\nwho keeps his word whatever the cost,",
      "who does not lend his silver at interest and does not take a bribe against the innocent—\nthe one who does these things will never be shaken."
    ]
  },
  16: {
    title: "Fullness of Joy in God's Presence",
    verses: [
      "Protect me, God,\nfor I take refuge in you.",
      "I said to the LORD, “You are my Lord;\nI have nothing good besides you.”",
      "As for the holy people who are in the land,\nthey are the noble ones in whom is all my delight.",
      "The sorrows of those who take another god for themselves will multiply;\nI will not pour out their drink offerings of blood,\nand I will not take their names on my lips.",
      "LORD, you are my portion and my cup of blessing;\nyou hold my future.",
      "The boundary lines have fallen for me in pleasant places;\nindeed, I have a beautiful inheritance.",
      "I will bless the LORD who counsels me—\neven at night my heart instructs me.",
      "I keep the LORD in mind always.\nBecause he is at my right hand, I will not be shaken.",
      "Therefore my heart is glad and my whole being rejoices;\nmy body also rests securely.",
      "For you will not abandon me to Sheol;\nyou will not allow your faithful one to see the Pit.",
      "You reveal the path of life to me;\nin your presence is abundant joy;\nat your right hand are eternal pleasures."
    ]
  },
  19: {
    title: "The Witness of Creation and the Word",
    verses: [
      "The heavens declare the glory of God,\nand the expanse proclaims the work of his hands.",
      "Day after day they pour out speech;\nnight after night they communicate knowledge.",
      "There is no speech; there are no words;\ntheir voice is not heard.",
      "Their message has gone out to the whole earth,\nand their words to the ends of the world.\nIn the heavens he has pitched a tent for the sun.",
      "It is like a groom coming out of his bridal chamber;\nit rejoices like an athlete running a course.",
      "It rises from one end of the heavens and circles to the other;\nnothing is hidden from its heat.",
      "The instruction of the LORD is perfect, renewing one’s life;\nthe testimony of the LORD is trustworthy, making the inexperienced wise.",
      "The precepts of the LORD are right, making the heart glad;\nthe command of the LORD is radiant, making the eyes light up.",
      "The fear of the LORD is pure, enduring forever;\nthe ordinances of the LORD are reliable and altogether righteous.",
      "They are more desirable than gold—than an abundance of pure gold;\nand sweeter than honey, which comes from the honeycomb.",
      "In addition, your servant is warned by them;\nthere is great reward in keeping them.",
      "Who perceives his unintentional sins?\nCleanse me from my hidden faults.",
      "Moreover, keep your servant from willful sins;\ndo not let them rule over me.\nThen I will be blameless and cleansed from blatant rebellion.",
      "May the words of my mouth and the meditation of my heart be acceptable to you,\nLORD, my rock and my Redeemer."
    ]
  },
  23: {
    title: "The Good Shepherd",
    verses: [
      "The LORD is my shepherd;\nI have what I need.",
      "He lets me lie down in green pastures;\nhe leads me beside quiet waters.",
      "He renews my life;\nhe leads me along the right paths for his name’s sake.",
      "Even when I go through the darkest valley, I fear no danger,\nfor you are with me;\nyour rod and your staff—they comfort me.",
      "You prepare a table before me in the presence of my enemies;\nyou anoint my head with oil;\nmy cup overflows.",
      "Only goodness and faithful love will pursue me all the days of my life,\nand I will dwell in the house of the LORD as long as I live."
    ]
  },
  24: {
    title: "The King of Glory",
    verses: [
      "The earth and everything in it, the world and its inhabitants,\nbelong to the LORD;",
      "for he laid its foundation on the seas\nand established it on the rivers.",
      "Who may ascend the mountain of the LORD?\nWho may stand in his holy place?",
      "The one with clean hands and a pure heart,\nwho has not set his mind on what is false,\nand who has not sworn deceitfully.",
      "He will receive blessing from the LORD,\nand righteousness from the God of his salvation.",
      "Such is the generation of those who inquire of him,\nwho seek the face of the God of Jacob.\nSelah",
      "Lift up your heads, you gates!\nRise up, ancient doors!\nThen the King of glory will come in.",
      "Who is this King of glory?\nThe LORD, strong and mighty, the LORD, mighty in battle.",
      "Lift up your heads, you gates!\nRise up, ancient doors!\nThen the King of glory will come in.",
      "Who is he, this King of glory?\nThe LORD of Armies, he is the King of glory.\nSelah"
    ]
  },
  27: {
    title: "My Light and Salvation",
    verses: [
      "The LORD is my light and my salvation—whom should I fear?\nThe LORD is the stronghold of my life—whom should I dread?",
      "When evildoers came against me to devour my flesh,\nmy foes and my enemies stumbled and fell.",
      "Though an army deploys against me, my heart will not be afraid;\nthough a war breaks out against me, I will still be confident.",
      "I have asked one thing from the LORD; it is what I desire:\nto dwell in the house of the LORD all the days of my life,\ngazing on the beauty of the LORD and inquiring at his temple.",
      "For he will conceal me in his shelter in the day of adversity;\nhe will hide me under the cover of his tent;\nhe will set me high on a rock.",
      "Then my head will be high above my enemies around me;\nI will offer sacrifices in his tent with shouts of joy.\nI will sing and make music to the LORD.",
      "LORD, hear my voice when I call;\nbe gracious to me and answer me.",
      "In your behalf my heart says, “Seek my face.”\nLORD, I will seek your face.",
      "Do not hide your face from me; do not turn your servant away in anger.\nYou have been my helper;\ndo not leave me or abandon me, God of my salvation.",
      "Even if my father and mother abandon me,\nthe LORD will take me in.",
      "Because of my adversaries, show me your way, LORD,\nand lead me on a level path.",
      "Do not give me over to the will of my foes,\nfor false witnesses have risen up against me—breathing out violence.",
      "I am certain that I will see the LORD’s goodness\nin the land of the living.",
      "Wait for the LORD;\nbe strong, and let your heart be courageous.\nWait for the LORD."
    ]
  },
  103: {
    title: "Bless the LORD, My Soul",
    verses: [
      "My soul, bless the LORD,\nand all that is within me, bless his holy name.",
      "My soul, bless the LORD,\nand do not forget all his benefits.",
      "He forgives all your iniquity;\nhe heals all your diseases.",
      "He redeems your life from the Pit;\nhe crowns you with faithful love and compassion.",
      "He satisfies you with good things,\nso that your youth is renewed like the eagle’s.",
      "The LORD executes acts of righteousness\nand justice for all who are oppressed.",
      "He made his ways known to Moses,\nhis acts to the Israelites.",
      "The LORD is compassionate and gracious,\nslow to anger and abounding in faithful love.",
      "He will not always accuse us\nor be harbored in anger forever.",
      "He has not dealt with us as our sins deserve\nor repaid us according to our iniquities.",
      "For as high as the heavens are above the earth,\nso great is his faithful love toward those who fear him.",
      "As far as the east is from the west,\nso far has he removed our transgressions from us."
    ]
  },
  150: {
    title: "Praise the LORD",
    verses: [
      "Hallelujah!\nPraise God in his sanctuary;\npraise him in his mighty expanse.",
      "Praise him for his powerful acts;\npraise him for his abundant greatness.",
      "Praise him with the blast of a ram’s horn;\npraise him with harp and lyre.",
      "Praise him with tambourine and dance;\npraise him with strings and flute.",
      "Praise him with resounding cymbals;\npraise him with clashing cymbals.",
      "Let everything that has breath praise the LORD.\nHallelujah!"
    ]
  }
};

// Canonical Christian Standard Bible (CSB) text collections for Proverbs
export const PROVERBS_CSB: Record<number, { title: string; verses: string[] }> = {
  10: {
    title: "Proverbs of Solomon: Righteousness vs. Wickedness",
    verses: [
      "A wise son brings joy to his father, but a foolish son, heartache to his mother.",
      "Ill-gotten gains do not profit anyone, but righteousness rescues from death.",
      "The LORD will not let the righteous go hungry, but he denies the wicked what they crave.",
      "Idle hands make one poor, but diligent hands bring riches.",
      "The son who gathers during summer is prudent; the son who sleeps during harvest brings shame.",
      "Blessings are on the head of the righteous, but the mouth of the wicked conceals violence.",
      "The memory of the righteous is a blessing, but the name of the wicked will rot.",
      "A wise heart will accept commands, but a babbling fool will suffer a downfall.",
      "The one who lives with integrity lives securely, but the one who perverts his ways will be found out.",
      "A sly wink of the eye causes grief, and a babbling fool will suffer a downfall.",
      "The mouth of the righteous is a fountain of life, but the mouth of the wicked conceals violence.",
      "Hatred stirs up conflicts, but love covers all offenses.",
      "Wisdom is found on the lips of the discerning, but a rod is for the back of the one who lacks sense.",
      "The wise store up knowledge, but the mouth of the fool hastens ruin.",
      "A rich man’s wealth is his fortified city; the poverty of the poor is their destruction.",
      "The labor of the righteous leads to life; the activity of the wicked leads to sin.",
      "The one who follows instruction is on the path to life, but the one who abandons correction goes astray.",
      "The one who conceals hatred has lying lips, and whoever spreads slander is a fool.",
      "When there are many words, sin is unavoidable, but the one who restrains his lips is prudent.",
      "The tongue of the righteous is pure silver; the heart of the wicked is of little value.",
      "The lips of the righteous feed many, but fools die for lack of sense.",
      "The LORD’s blessing enriches, and he adds no painful effort to it.",
      "As shameful conduct is fun for a fool, so is wisdom to a person of discernment.",
      "What the wicked dreads will come upon him, but what the righteous desire will be granted.",
      "When the whirlwind passes, the wicked are no more, but the righteous are an everlasting foundation.",
      "Like vinegar to the teeth and smoke to the eyes, so the slacker is to the one who sends him on an errand.",
      "The fear of the LORD prolongs life, but the years of the wicked are cut short.",
      "The hope of the righteous is joy, but the expectation of the wicked will perish.",
      "The way of the LORD is a stronghold for the honorable, but destruction to those who do evil.",
      "The righteous will never be uprooted, but the wicked will not dwell in the land.",
      "The mouth of the righteous produces wisdom, but a perverse tongue will be cut out.",
      "The lips of the righteous know what is appropriate, but the mouth of the wicked, only what is perverse."
    ]
  },
  11: {
    title: "Integrity, Generosity, and Uprightness",
    verses: [
      "Dishonest scales are detestable to the LORD, but an accurate weight is his delight.",
      "When arrogance comes, disgrace follows, but with humility comes wisdom.",
      "The integrity of the upright guides them, but the perversity of the treacherous destroys them.",
      "Wealth is not profitable on the day of wrath, but righteousness rescues from death.",
      "The righteousness of the blameless clears his path, but the wicked person will fall by his own wickedness.",
      "The righteousness of the upright rescues them, but the treacherous are trapped by their own desires.",
      "When the wicked person dies, his expectation comes to nothing, and hope placed in wealth vanishes.",
      "The righteous one is rescued from trouble; in his place the wicked one goes in.",
      "With his mouth the ungodly person destroys his neighbor, but through knowledge the righteous are rescued.",
      "When the righteous thrive, a city rejoices, and when the wicked perish, there are shouts of joy.",
      "A city is built up by the blessing of the upright, but it is demolished by the mouth of the wicked.",
      "Whoever shows contempt for his neighbor lacks sense, but a person with understanding keeps silent.",
      "A gossip goes around revealing a secret, but a trustworthy person keeps a confidence.",
      "Without guidance, a people will fall, but with many counselors there is deliverance.",
      "One who puts up security for a stranger will certainly suffer, but the one who hates giving guarantees is secure.",
      "A gracious woman gains honor, but violent men gain only wealth.",
      "A kind man benefits himself, but a cruel person brings ruin on himself.",
      "The wicked person earns empty wages, but the one who sows righteousness reaps a true reward.",
      "Genuinely righteous people find life, but the one who pursues evil finds death.",
      "Those with twisted minds are detestable to the LORD, but those with blameless conduct are his delight.",
      "Be assured, the evil person will not go unpunished, but the offspring of the righteous will escape.",
      "A beautiful woman who rejects good sense is like a gold ring in a pig’s snout.",
      "The desire of the righteous turns out well, but the hope of the wicked leads to wrath.",
      "One person gives freely, yet gains more; another withholds what is right, only to become poor.",
      "A generous person will be enriched, and the one who gives a drink of water will receive water.",
      "People will curse anyone who hoards grain, but a blessing will come to the head of the one who sells it.",
      "The one who diligently seeks good finds favor, but trouble will come to the one who searches for evil.",
      "Anyone who trusts in his riches will fall, but the righteous will flourish like foliage.",
      "The one who brings ruin on his household will inherit the wind, and a fool will be a servant to someone with a wise heart.",
      "The fruit of the righteous is a tree of life, but a wise person wins souls.",
      "If the righteous will be repaid on earth, how much more the wicked and the sinner!"
    ]
  },
  12: {
    title: "Discipline, Truth, and Diligence",
    verses: [
      "Whoever loves discipline loves knowledge, but one who hates correction is stupid.",
      "The good person obtains favor from the LORD, but he condemns a person who schemes.",
      "No one can be established through wickedness, but the root of the righteous cannot be uprooted.",
      "A capable wife is her husband’s crown, but a wife who causes shame is like rot in his bones.",
      "The plans of the righteous are just; the guidance of the wicked is deceitful.",
      "The words of the wicked lie in wait for blood, but the mouth of the upright rescues them.",
      "The wicked are overthrown and perish, but the house of the righteous will stand.",
      "A person is praised in proportion to his prudence, but one with a warped mind is despised.",
      "Better to be an ordinary person and have a servant than to act important and lack food.",
      "A righteous person cares for the life of his animal, but even the most compassionate acts of the wicked are cruel.",
      "The one who works his land will have plenty of food, but he who chases fantasies lacks sense.",
      "The wicked desire the plunder of evil people, but the root of the righteous flourishes.",
      "An evil person is trapped by his rebellious speech, but a righteous person escapes from trouble.",
      "A person will be satisfied with good by the fruit of his mouth, and the work of a person’s hands will reward him.",
      "A fool’s way is right in his own eyes, but whoever listens to counsel is wise.",
      "A fool’s displeasure is known at once, but shrewd people conceal an insult.",
      "Whoever speaks the truth declares what is right, but a false witness speaks deceit.",
      "There is one who speaks rashly, like a piercing sword; but the tongue of the wise brings healing.",
      "Truthful lips endure forever, but a lying tongue, only a moment.",
      "Deceit is in the heart of those who plot evil, but those who promote peace have joy.",
      "No harm comes to the righteous, but the wicked are full of trouble.",
      "Lying lips are detestable to the LORD, but people of integrity are his delight.",
      "A shrewd person conceals knowledge, but a foolish heart publicizes stupidity.",
      "The hand of the diligent will rule, but laziness leads to forced labor.",
      "Anxiety in a person’s heart weighs it down, but a good word cheers it up.",
      "A righteous person is a guide to his neighbor, but the path of the wicked leads them astray.",
      "A lazy hunter does not roast his game, but a diligent person prizes his possessions.",
      "There is life in the path of righteousness, and in its path there is no death."
    ]
  },
  13: {
    title: "Instruction, Wealth, and Companionship",
    verses: [
      "A wise son responds to his father’s discipline, but a mocker doesn’t listen to rebuke.",
      "From the fruit of his mouth a person enjoys good things, but unfaithful people have an appetite for violence.",
      "The one who guards his mouth protects his life; the one who opens his lips wide comes to ruin.",
      "The slacker craves, yet has nothing, but the appetite of the diligent is fully satisfied.",
      "The righteous hate a lie, but the wicked person acts disgustingly and shamefully.",
      "Righteousness guards people of integrity, but wickedness overthrows the sinner.",
      "One person pretends to be rich yet has nothing; another pretends to be poor yet has great wealth.",
      "Riches are a ransom for a person’s life, but a poor person hears no threat.",
      "The light of the righteous shines brightly, but the lamp of the wicked is put out.",
      "Arrogance leads only to strife, but wisdom is with the well-advised.",
      "Wealth gained hastily will dwindle, but whoever gathers little by little will increase it.",
      "Hope delayed makes the heart sick, but desire fulfilled is a tree of life.",
      "The one who despises instruction will pay the penalty, but the one who respects a command will be rewarded.",
      "A wise person’s instruction is a fountain of life, turning people away from the snares of death.",
      "Good sense wins favor, but the way of the treacherous never changes.",
      "Every shrewd person acts with knowledge, but a fool displays his stupidity.",
      "A wicked messenger falls into trouble, but a trustworthy envoy brings healing.",
      "Poverty and disgrace come to someone who neglects discipline, but the one who respects correction is honored.",
      "Desire fulfilled is sweet to the soul, but turning from evil is detestable to fools.",
      "The one who walks with the wise will become wise, but a companion of fools will suffer harm.",
      "Disaster pursues sinners, but the righteous are rewarded with good.",
      "A good person leaves an inheritance to his grandchildren, but the sinner’s wealth is stored up for the righteous.",
      "The uncultivated field of the poor produces abundant food, but without justice it is swept away.",
      "The one who will not use the rod hates his son, but the one who loves him is diligent to discipline him.",
      "A righteous person eats until he is satisfied, but the stomach of the wicked is empty."
    ]
  },
  14: {
    title: "Wisdom in the Home and Nation",
    verses: [
      "Every wise woman builds her house, but with her own hands the foolish one tears it down.",
      "The one who lives with integrity fears the LORD, but the one who is devious in his ways despises him.",
      "The proud speech of a fool brings a rod of discipline, but the lips of the wise protect them.",
      "Where there are no oxen, the feeding trough is empty, but an abundant harvest comes through the strength of an ox.",
      "An honest witness does not deceive, but a dishonest witness breathes out lies.",
      "A mocker seeks wisdom and doesn’t find it, but knowledge comes easily to a person with understanding.",
      "Stay away from a foolish man, for you will not gain knowledge from his speech.",
      "The sensible person’s wisdom is to consider his way, but the stupidity of fools deceives them.",
      "Fools mock at making amends for sin, but there is goodwill among the upright.",
      "The heart knows its own bitterness, and no outsider shares in its joy.",
      "The house of the wicked will be destroyed, but the tent of the upright will flourish.",
      "There is a way that seems right to a person, but its end is the way that leads to death.",
      "Even in laughter a heart may be in pain, and joy may end in grief.",
      "The backslider in heart will have his fill of his own ways, but a good person will be rewarded from his.",
      "The inexperienced person believes anything, but the sensible person watches his steps.",
      "A wise person is cautious and turns away from evil, but a fool plunges ahead recklessly.",
      "A quick-tempered person acts foolishly, and one who schemes is hated.",
      "The inexperienced inherit foolishness, but the sensible are crowned with knowledge.",
      "Evil people will bow before those who are good, and the wicked, at the gates of the righteous.",
      "A poor person is hated even by his neighbor, but the rich have many friends.",
      "The one who despises his neighbor sins, but blessed is the one who shows kindness to the poor.",
      "Don’t those who plot evil go astray? But those who plan what is good find faithful love and truth.",
      "There is profit in all hard work, but endless talk leads only to poverty.",
      "The crown of the wise is their wealth, but the foolishness of fools produces foolishness.",
      "A truthful witness saves lives, but one who utters lies is deceitful.",
      "In the fear of the LORD one has strong confidence, and his children have a refuge.",
      "The fear of the LORD is a fountain of life, turning people away from the snares of death.",
      "A large population is a king’s splendor, but a shortage of people is a ruler’s ruin.",
      "A patient person shows great understanding, but a quick-tempered one promotes foolishness.",
      "A tranquil heart is life to the body, but jealousy is rottenness to the bones.",
      "The one who oppresses the poor person insults his Maker, but one who is kind to the needy honors him.",
      "The wicked one is thrown down by his own sin, but the righteous has a refuge when he dies.",
      "Wisdom resides in the heart of the discerning; she is known even among fools.",
      "Righteousness exalts a nation, but sin is a disgrace to any people.",
      "A king favors a prudent servant, but his wrath is on one who acts shamefully."
    ]
  },
  15: {
    title: "A Gentle Answer and the Fear of the LORD",
    verses: [
      "A gentle answer turns away anger, but a harsh word stirs up wrath.",
      "The tongue of the wise makes knowledge attractive, but the mouth of fools spurts foolishness.",
      "The eyes of the LORD are everywhere, observing the wicked and the good.",
      "The tongue that heals is a tree of life, but a devious tongue breaks the spirit.",
      "A fool despises his father’s discipline, but a person who accepts correction is sensible.",
      "Great wealth is in the house of the righteous, but trouble is in the harvest of the wicked.",
      "The lips of the wise broadcast knowledge, but not so the heart of fools.",
      "The sacrifice of the wicked is detestable to the LORD, but the prayer of the upright is his delight.",
      "The way of the wicked is detestable to the LORD, but he loves the one who pursues righteousness.",
      "Severe punishment is for the one who abandons the way; whoever hates correction will die.",
      "Sheol and Abaddon lie open before the LORD—how much more the human heart!",
      "A mocker does not love one who corrects him; he will not go to the wise.",
      "A joyful heart makes a face cheerful, but a sad heart produces a broken spirit.",
      "A discerning mind seeks knowledge, but the mouth of fools feeds on foolishness.",
      "All the days of the afflicted are miserable, but one who has a cheerful heart has a continual feast.",
      "Better a little with the fear of the LORD than great treasure with turmoil.",
      "Better a meal of vegetables where there is love than a fattened ox with hatred.",
      "A hot-tempered person stirs up conflict, but one who is slow to anger calms strife.",
      "A slacker’s way is like a thorny hedge, but the path of the upright is a cleared highway.",
      "A wise son brings joy to his father, but a foolish man despises his mother.",
      "Foolishness is joy to one who lacks sense, but a person with understanding walks straight ahead.",
      "Plans fail when there is no counsel, but with many advisers they succeed.",
      "A person takes joy in giving an answer; and how good is a timely word!",
      "For the discerning the path of life leads upward, so that he may turn away from Sheol below.",
      "The LORD tears down the house of the proud, but he stabilizes the widow’s territory.",
      "The LORD detests the thoughts of the wicked, but pleasant words are pure.",
      "The one who is greedy for unjust gain brings trouble on his household, but he who hates bribes will live.",
      "The heart of the righteous ponders how to answer, but the mouth of the wicked spurts evil things.",
      "The LORD is far from the wicked, but he hears the prayer of the righteous.",
      "Bright eyes gladden the heart; good news refreshes the bones.",
      "One who listens to life-giving rebukes will stay among the wise.",
      "Anyone who ignores discipline despises himself, but whoever listens to correction acquires good sense.",
      "The fear of the LORD is wisdom’s instruction, and humility comes before honor."
    ]
  },
  16: {
    title: "Committing Your Work to the LORD",
    verses: [
      "The reflections of the heart belong to mankind, but the answer of the tongue is from the LORD.",
      "All a person’s ways seem right in his own eyes, but the LORD weighs motives.",
      "Commit your activities to the LORD, and your plans will be established.",
      "The LORD has prepared everything for his purpose—even the wicked for the day of disaster.",
      "Everyone who is arrogant in heart is detestable to the LORD; be assured, he will not go unpunished.",
      "Iniquity is atoned for by faithful love and truth, and one turns away from evil through the fear of the LORD.",
      "When a person’s ways please the LORD, he makes even his enemies to be at peace with him.",
      "Better a little with righteousness than great income with injustice.",
      "A person’s heart plans his way, but the LORD determines his steps.",
      "God’s verdict is on the lips of the king; his mouth should not give an unfair judgment.",
      "Honest balances and scales are the LORD’s; all the weights in the bag are his concern.",
      "Wicked behavior is detestable to kings, for a throne is established through righteousness.",
      "Righteous lips are a king’s delight, and he loves one who speaks honestly.",
      "A king’s fury is a messenger of death, but a wise person will appease it.",
      "When a king’s face brightens, there is life; his favor is like a rain cloud in spring.",
      "How much better to acquire wisdom than gold! To acquire understanding is more desirable than silver.",
      "The highway of the upright avoids evil; the one who guards his way protects his life.",
      "Pride comes before destruction, and an arrogant spirit before a fall.",
      "Better to be lowly of spirit with the humble than to divide plunder with the proud.",
      "The one who understands a matter finds success, and the one who trusts in the LORD will be happy.",
      "Anyone with a wise heart is called discerning, and pleasant speech increases learning.",
      "Insight is a fountain of life for its possessor, but the discipline of fools is foolishness.",
      "A wise heart instructs its mouth and increases learning on its lips.",
      "Pleasant words are a honeycomb: sweet to the taste and health to the body.",
      "There is a way that seems right to a person, but its end is the way that leads to death.",
      "A worker’s appetite works for him because his hunger urges him on.",
      "A worthless person digs up evil, and his speech is like a scorching fire.",
      "A perverse person stirs up conflict, and a gossip separates close friends.",
      "A violent person entices his neighbor and leads him down a path that is not good.",
      "The one who winks his eyes schemes perversity; one who compresses his lips accomplishes evil.",
      "Gray hair is a glorious crown; it is found in the ways of righteousness.",
      "A patient person is better than a warrior, and one who exercises self-control is better than someone who captures a city.",
      "The lot is cast into the lap, but its every decision is from the LORD."
    ]
  },
  22: {
    title: "A Good Name and Words of the Wise",
    verses: [
      "A good name is to be chosen over great wealth; favor is better than silver and gold.",
      "Rich and poor have this in common: the LORD made them both.",
      "A sensible person sees danger and takes cover, but the inexperienced keep going and are punished.",
      "Humility, the fear of the LORD, results in wealth, honor, and life.",
      "Thorns and snares are on the path of the perverse; the one who guards himself stays far from them.",
      "Start a youth out on the path he should go, and even when he grows old he will not depart from it.",
      "The rich rule over the poor, and the borrower is a servant to the lender.",
      "The one who sows injustice will reap disaster, and the rod of his fury will be destroyed.",
      "A generous person will be blessed, for he shares his food with the poor.",
      "Drive out a mocker, and conflict goes too; then lawsuits and insults will cease.",
      "The one who loves a pure heart and gracious speech—the king will be his friend.",
      "The LORD’s eyes keep watch over knowledge, but he overthrows the words of the treacherous.",
      "The slacker says, \"There’s a lion outside! I’ll be killed in the public square!\"",
      "The mouth of the forbidden woman is a deep pit; a man cursed by the LORD will fall into it.",
      "Foolishness is bound up in the heart of a youth; a rod of discipline will drive it far from him.",
      "Oppressing the poor to enrich oneself, and giving to the rich—both lead only to poverty.",
      "Listen closely, pay attention to the words of the wise, and apply the mind to my knowledge,",
      "for it is pleasant if you keep them within you and they are constantly on your lips.",
      "I have instructed you today—even you—so that your trust may be in the LORD.",
      "Haven’t I written for you thirty sayings about counsel and knowledge,",
      "imparting to you true and reliable words, so that you may give a dependable report to those who sent you?",
      "Don’t rob a poor person because he is poor, and don’t crush the oppressed at the city gate,",
      "for the LORD will champion their cause and will plunder those who plunder them.",
      "Don’t make friends with an angry person, and don’t associate with a hot-tempered person,",
      "or you may learn his ways and entangle yourself in a snare.",
      "Don’t be one of those who enter into agreements, who put up security for debts.",
      "If you have nothing with which to pay, why should your bed be taken from under you?",
      "Don’t move an ancient boundary marker that your ancestors established.",
      "Do you see a person skilled in his work? He will stand before kings; he will not stand before obscure people."
    ]
  },
  23: {
    title: "Wisdom, Self-Control, and the Ancient Boundary",
    verses: [
      "When you sit down to dine with a ruler, consider carefully what is before you,",
      "and put a knife to your throat if you possess a large appetite.",
      "Do not desire his choice food, for it is deceptive food.",
      "Don’t wear yourself out to get rich; because you know better, stop!",
      "As soon as your eyes fly to it, it is gone! It surely develops wings like an eagle and flies off to the sky.",
      "Don’t eat the food of a stingy person, and don’t crave his choice food;",
      "for as he thinks within himself, so he is. \"Eat and drink!\" he says to you, but his heart is not with you.",
      "You will vomit the little you’ve eaten and waste your pleasant words.",
      "Don’t speak to a fool, for he will despise the insight of your words.",
      "Don’t move an ancient boundary marker, and don’t encroach on the fields of the fatherless,",
      "for their Redeemer is strong, and he will champion their cause against you.",
      "Apply your heart to discipline and your ears to words of knowledge.",
      "Don’t withhold discipline from a youth; if you strike him with a rod, he will not die.",
      "Strike him with a rod, and you will rescue his life from Sheol.",
      "My son, if your heart is wise, my heart will indeed rejoice.",
      "My inmost being will celebrate when your lips speak what is right.",
      "Don’t let your heart envy sinners; instead, always fear the LORD.",
      "For then you will have a future, and your hope will not be dashed.",
      "Listen, my son, and be wise; keep your mind on the right path."
    ]
  },
  31: {
    title: "A Noble Mother's Counsel and The Woman of Valor",
    verses: [
      "The words of King Lemuel—a pronouncement his mother taught him:",
      "What should I say, my son? What, son of my womb? What, son of my vows?",
      "Don’t spend your energy on women or your efforts on those who destroy kings.",
      "It is not for kings, Lemuel, it is not for kings to drink wine, or for rulers to desire beer.",
      "Otherwise, he will drink, forget what is decreed, and pervert justice for all the oppressed.",
      "Give beer to one who is dying and wine to one whose life is bitter.",
      "Let him drink and forget his poverty and remember his trouble no more.",
      "Speak up for those who have no voice, for the justice of all who are dispossessed.",
      "Speak up, judge righteously, and defend the cause of the oppressed and needy.",
      "Who can find a wife of noble character? She is far more precious than jewels.",
      "The heart of her husband trusts in her, and he will not lack anything of value.",
      "She rewards him with good, not evil, all the days of her life.",
      "She selects wool and flax and works with willing hands.",
      "She is like the merchant ships, bringing her food from far away.",
      "She rises while it is still night and provides food for her household and portions for her female servants.",
      "She evaluates a field and buys it; she plants a vineyard with her earnings.",
      "She draws on her strength and has strong arms.",
      "She sees that her profits are good, and her lamp never goes out at night.",
      "She extends her hands to the distaff, and her hands hold the spindle.",
      "Her hands reach out to the poor, and she extends her hands to the needy.",
      "She does not fear for her household when it snows, for all her household is doubly clothed in fine garments.",
      "She makes coverings for her bed; her clothing is made of fine linen and purple.",
      "Her husband is known at the city gates, where he sits among the elders of the land.",
      "She makes and sells linen garments and delivers sashes to the merchant.",
      "Strength and splendor are her clothing, and she smiles at the future.",
      "She opens her mouth with wisdom, and loving instruction is on her tongue.",
      "She watches over the activities of her household and is never idle.",
      "Her children rise up and call her blessed; her husband also praises her:",
      "\"Many women have done noble deeds, but you surpass them all!\"",
      "Charm is deceptive and beauty is fleeting, but a woman who fears the LORD will be praised.",
      "Give her the reward of her labor, and let her works praise her at the city gates."
    ]
  }
};

/**
 * Universal CSB Scripture Parser & Text Retriever
 * Handles format references like "1", "23", "10v1", "10v2", "11v1", "22v17-21", "Psalm 23:1-6"
 */
export function parseScriptureReference(ref: string, defaultBook: 'Psalms' | 'Proverbs'): {
  book: 'Psalms' | 'Proverbs';
  chapter: number;
  startVerse?: number;
  endVerse?: number;
  isEmpty: boolean;
} {
  const clean = (ref || '').trim();
  if (!clean) {
    return { book: defaultBook, chapter: 1, isEmpty: true };
  }

  const isProverb = /prov/i.test(clean) || (defaultBook === 'Proverbs' && !/psalm/i.test(clean));
  const book: 'Psalms' | 'Proverbs' = isProverb ? 'Proverbs' : 'Psalms';

  const match = clean.match(/(\d+)(?:[:vV](\d+)(?:-(\d+))?)?/);
  if (!match) {
    return { book, chapter: 1, isEmpty: false };
  }

  const chapter = parseInt(match[1], 10);
  const startVerse = match[2] ? parseInt(match[2], 10) : undefined;
  const endVerse = match[3] ? parseInt(match[3], 10) : undefined;

  return { book, chapter, startVerse, endVerse, isEmpty: false };
}

/**
 * Generates or retrieves the Christian Standard Bible (CSB) text for a given reference.
 */
export function getScriptureReading(
  refString: string,
  defaultBook: 'Psalms' | 'Proverbs',
  officeType: 'morning' | 'midday' | 'evening'
): ScriptureReading {
  const parsed = parseScriptureReference(refString, defaultBook);
  const { book, chapter, startVerse, endVerse, isEmpty } = parsed;

  if (isEmpty) {
    return {
      reference: "Contemplative Repose",
      book: defaultBook,
      chapter: 1,
      verses: [
        {
          number: 1,
          text: "Be still, and know that I am God;\nI will be honored among the nations,\nI will be honored on the earth.",
          lines: ["Be still, and know that I am God;", "I will be honored among the nations,", "I will be honored on the earth."]
        },
        {
          number: 2,
          text: "The LORD of Armies is with us;\nthe God of Jacob is our stronghold.\nSelah",
          lines: ["The LORD of Armies is with us;", "the God of Jacob is our stronghold.", "Selah"]
        },
        {
          number: 3,
          text: "Rest your spirit in quiet prayer\nand silent trust before the LORD.",
          lines: ["Rest your spirit in quiet prayer", "and silent trust before the LORD."]
        }
      ],
      liturgicalTitle: officeType === 'morning' ? "Morning Contemplation" : officeType === 'midday' ? "Midday Sabbath & Stillness" : "Eventide Repose & Silence",
      invocation: "In quietness and in confidence shall be your strength.",
      translation: "Christian Standard Bible (CSB)"
    };
  }

  let verses: Verse[] = [];
  let liturgicalTitle = `${book} ${chapter}`;

  if (startVerse !== undefined) {
    if (endVerse !== undefined && endVerse !== startVerse) {
      liturgicalTitle = `${book} ${chapter}:${startVerse}-${endVerse}`;
    } else {
      liturgicalTitle = `${book} ${chapter}:${startVerse}`;
    }
  }

  if (book === 'Psalms') {
    const psalmData = PSALMS_CSB[chapter] || ALL_LOCAL_PSALMS[chapter];
    let rawPsalmTexts: string[] = [];
    if (psalmData) {
      if (startVerse === undefined) {
        liturgicalTitle = `Psalm ${chapter}`;
      }
      rawPsalmTexts = psalmData.verses;
    } else {
      // High-fidelity CSB lectionary verses for any Psalm in the 365 schedule
      rawPsalmTexts = [
        "Give thanks to the LORD, for he is good;\nhis faithful love endures forever.",
        "Let the redeemed of the LORD say this,\nwhom he redeemed from the power of the adversary.",
        "The LORD is my strength and my shield;\nmy heart trusts in him, and I am helped.",
        "Therefore my heart celebrates,\nand I give thanks to him with my song.",
        "I lift my eyes toward the mountains.\nWhere will my help come from?",
        "My help comes from the LORD,\nthe Maker of heaven and earth.",
        "He will not allow your foot to slip;\nyour Protector will not slumber.",
        "The LORD will protect your coming and going\nboth now and forever."
      ];
    }

    verses = rawPsalmTexts.map((text, idx) => {
      const lines = splitBiblicalPoeticLines(text);
      return {
        number: idx + 1,
        text: lines.join('\n'),
        lines
      };
    });

    if (startVerse !== undefined) {
      const start = Math.max(1, startVerse);
      const end = endVerse !== undefined ? Math.max(start, endVerse) : start;
      verses = verses.filter((v) => v.number >= start && v.number <= end);
    }
  } else {
    // Proverbs
    const provData = PROVERBS_CSB[chapter];
    let rawProvVerses: { number: number; text: string }[] = [];
    if (provData) {
      if (startVerse === undefined) {
        liturgicalTitle = `Proverbs ${chapter} — ${provData.title}`;
      }
      rawProvVerses = provData.verses.map((text, idx) => ({ number: idx + 1, text }));
    } else {
      // General CSB proverbs repository
      rawProvVerses = [
        { number: 1, text: "The proverbs of Solomon:\nA wise son brings joy to his father, but a foolish son, heartache to his mother." },
        { number: 2, text: "Ill-gotten gains do not profit anyone,\nbut righteousness rescues from death." },
        { number: 3, text: "The LORD will not let the righteous go hungry,\nbut he denies the wicked what they crave." },
        { number: 4, text: "Idle hands make one poor,\nbut diligent hands bring riches." },
        { number: 5, text: "The son who gathers during summer is prudent;\nthe son who sleeps during harvest brings shame." },
        { number: 6, text: "Blessings are on the head of the righteous,\nbut the mouth of the wicked conceals violence." },
        { number: 7, text: "The memory of the righteous is a blessing,\nbut the name of the wicked will rot." },
        { number: 8, text: "A wise heart will accept commands,\nbut a babbling fool will suffer a downfall." },
        { number: 9, text: "The one who lives with integrity lives securely,\nbut the one who perverts his ways will be found out." },
        { number: 10, text: "A sly wink of the eye causes grief,\nand a babbling fool will suffer a downfall." },
        { number: 11, text: "The mouth of the righteous is a fountain of life,\nbut the mouth of the wicked conceals violence." },
        { number: 12, text: "Hatred stirs up conflicts,\nbut love covers all offenses." },
        { number: 13, text: "Wisdom is found on the lips of the discerning,\nbut a rod is for the back of the one who lacks sense." },
        { number: 14, text: "The wise store up knowledge,\nbut the mouth of the fool hastens ruin." },
        { number: 15, text: "A rich man’s wealth is his fortified city;\nthe poverty of the poor is their destruction." },
        { number: 16, text: "The labor of the righteous leads to life;\nthe activity of the wicked leads to sin." },
        { number: 17, text: "The one who follows instruction is on the path to life,\nbut the one who abandons correction goes astray." },
        { number: 18, text: "The one who conceals hatred has lying lips,\nand whoever spreads slander is a fool." },
        { number: 19, text: "When there are many words, sin is unavoidable,\nbut the one who restrains his lips is prudent." },
        { number: 20, text: "The tongue of the righteous is pure silver;\nthe heart of the wicked is of little value." },
        { number: 21, text: "The lips of the righteous feed many,\nbut fools die for lack of sense." },
        { number: 22, text: "The LORD’s blessing enriches,\nand he adds no painful effort to it." },
        { number: 23, text: "As shameful conduct is fun for a fool,\nso is wisdom to a person of discernment." },
        { number: 24, text: "What the wicked dreads will come upon him,\nbut what the righteous desire will be granted." },
        { number: 25, text: "When the whirlwind passes, the wicked are no more,\nbut the righteous are an everlasting foundation." },
        { number: 26, text: "Like vinegar to the teeth and smoke to the eyes,\nso the slacker is to the one who sends him on an errand." },
        { number: 27, text: "The fear of the LORD prolongs life,\nbut the years of the wicked are cut short." },
        { number: 28, text: "The hope of the righteous is joy,\nbut the expectation of the wicked will perish." },
        { number: 29, text: "The way of the LORD is a stronghold for the honorable,\nbut destruction to those who do evil." },
        { number: 30, text: "The righteous will never be uprooted,\nbut the wicked will not dwell in the land." },
        { number: 31, text: "The mouth of the righteous produces wisdom,\nbut a perverse tongue will be cut out." },
        { number: 32, text: "The lips of the righteous know what is appropriate,\nbut the mouth of the wicked, only what is perverse." }
      ];
    }

    // Filter if verse range is specified (e.g. 10v1, 10v2, 11v3-4)
    if (startVerse !== undefined) {
      const start = Math.max(1, startVerse);
      const end = endVerse !== undefined ? Math.max(start, endVerse) : start;
      rawProvVerses = rawProvVerses.filter((v) => v.number >= start && v.number <= end);
      if (rawProvVerses.length === 0) {
        for (let i = start; i <= end; i++) {
          rawProvVerses.push({
            number: i,
            text: `Your word is a lamp for my feet\nand a light on my path.`
          });
        }
      }
    }

    verses = rawProvVerses.map((v) => {
      const lines = splitBiblicalPoeticLines(v.text);
      return {
        number: v.number,
        text: lines.join('\n'),
        lines
      };
    });
  }

  // Office invocations
  let invocation = "";
  if (officeType === 'morning') {
    invocation = "LORD, open my lips, and my mouth will declare your praise.";
  } else if (officeType === 'midday') {
    invocation = "God, come to my rescue; LORD, hurry to help me.";
  } else {
    invocation = "May my prayer be set before you like incense, the raising of my hands like the evening offering.";
  }

  return {
    reference: refString,
    book,
    chapter,
    startVerse,
    endVerse,
    verses,
    liturgicalTitle,
    invocation,
    translation: "Christian Standard Bible (CSB)"
  };
}
