# Sam Altman: judged samples
Run `20261111-212941`. Held-out requests from posts the model never saw. For each: the request, Sam Altman's real passage, then the three candidates the judge compared. Judge (gpt-5.4) totals: adapter 12, GPT-5.5 imitating 28, base model 0, of 40 votes. Held-out perplexity 17.892 (base) to 9.96 (adapter).

---

## 1. Fundraising Mistakes Founders Make - Sam Altman

**Request.** Write a passage about how founders can hurt fundraising by seeming overly agreeable instead of having a firm point of view. Explain that a founder should listen carefully to smart investors but still defend the ideas they truly believe in, and that a strong founding vision can usually be summed up simply while also offering at least one genuinely new insight. Include the idea that it’s fine not to know everything yet, but a founder should still have clear initial hypotheses. Also cover why not knowing key metrics is a major problem in early-stage pitches: investors want to know whether the team understands what needs to be done and whether it can execute, and being on top of the numbers is a strong sign of operational quality. Aim for about 220 words.

**Judge's two votes:** GPT-5.5, GPT-5.5.

**Sam Altman's real passage**

> If you don’t seem to have any strong feelings or conviction, and you agree with every suggestion the investor makes about your business, you'll risk coming across as lacking a clear vision. You should always listen to what someone smart has to say, but you should be firm on the things you really believe.
> 
> Founders with a clear vision can usually explain what they’re doing and why it matters in just a handful of words. Clear vision also usually entails at least one big new idea. Even if it’s a familiar problem, there should be something important the investor hasn’t heard before.
> 
> It’s ok to have some big unknowns, of course. You’re not expected to have all the answers, but you should have clear theses to start with.
> 
> • Not knowing key metrics
> 
> There are two questions I really look at in early stage investments:
> 
> - Does the team know what to do?
> 
> - Can the team do it?
> 
> The first question is addressed by the bullet point above. The second is addressed by showing that the team cares about operational quality. I’ve found that teams that execute well always know their numbers (or current status if in R+D mode) cold, and that it’s one of the best predictors of execution quality. It’s surprising how many companies pitch investors without knowing this information.

**Adapter (Buntai)**

> *Be difficult. I think this is the most important thing you can do. It’s easy to say yes to everyone. You need to be willing to stand your ground and say no. If you don’t, people will underestimate you.
> 
> If you’re willing to say no, people will respect you. And if people respect you, they’ll be more likely to invest in you. But you also need to be willing to say yes (it’s great to be an effective collaborator), so you need to strike a balance.
> 
> You can be difficult without being rude; most people are willing to say no to a founder who has a clear vision and is willing to fight for it. A good founder knows how to listen to other people and make compromises, but still defends his or her own ideas.
> 
> Be clear about your vision. It should be a simple sentence, but it should include at least one new idea. You don’t have to know all the answers now—just get a hypothesis about how to build the thing you want to build. You’ll learn more as you go along.
> 
> Don’t hide the fact that you don’t know some of the numbers. It’s very bad when you don’t know the numbers. Investors will ask you about them anyway, and they’ll notice if you don’t know what you’re talking about. In addition to figuring out what needs to be done, investors want to see that the company can get things done.
> 
> You should always know the numbers and be able to explain them clearly. This is a sign of operational excellence, which is probably the best quality you can have at a startup.

**GPT-5.5 imitating**

> One subtle way founders hurt themselves in fundraising is by being too agreeable.
> 
> It feels safe to nod along. An investor says the market is wrong, or the product should go in a different direction, and the founder immediately says yes. This can look coachable in the moment, but it often has the opposite effect. Investors are not just trying to find someone who can take advice. They are trying to find someone who has seen something important before other people have.
> 
> The best founders listen very carefully, especially to smart skeptics. They ask good questions. They update when the facts change. But they do not abandon the ideas they truly believe after one objection. A strong company usually begins with a firm point of view: the world is changing in this way, customers will behave in this surprising way, and if we build this, it can become very large.
> 
> That vision should usually be simple to explain. If it takes twenty minutes to describe the core insight, there may not be one. But simple does not mean obvious. The best versions contain at least one genuinely new belief.
> 
> It is fine not to know everything yet. Startups are searches. But you should have clear initial hypotheses: who the customer is, why they will buy, what will make growth work, and what must be proven next.
> 
> Not knowing the key metrics is much worse. Early investors know the numbers are small and imperfect. What they want to know is whether the team understands what needs to be done and can execute. Being on top of the numbers is one of the strongest signs that you will.

**Base Qwen3-VL-4B**

> Founders who appear overly agreeable risk undermining their fundraising potential. While listening to smart investors is crucial, surrendering too quickly to feedback can signal weakness or lack of conviction—traits that scare off serious investors. A founder must balance receptiveness with clarity: listen, but don’t lose your core belief. Your vision should be succinct yet powerful, distilled into a simple, compelling thesis—and ideally, include at least one genuinely novel insight that sets you apart.
> 
> It’s perfectly acceptable not to know everything yet; early-stage founders are learning. But you must have clear initial hypotheses. These aren’t guesses—they’re your operating assumptions, your roadmap. Without them, investors see confusion, not clarity.
> 
> Equally critical: not knowing key metrics is a dealbreaker. Investors want to see that you understand what matters and can execute. Being on top of the numbers—whether user growth, CAC, LTV, or retention—is a strong indicator of operational discipline and realism. If you can’t answer “What’s our burn rate?” or “How do we scale?” before the pitch, you’re signaling lack of preparedness.
> 
> Your strength lies in your conviction, your clarity, and your numbers. Don’t apologize for being right. Just make sure you’re ready to prove it.

---

## 2. Unit Economics - Sam Altman

**Request.** Write about why losses are not inherently alarming in a startup, but become dangerous when growth doesn’t improve economics or when cash reserves are running low. Explain that if a company can only survive in a cutthroat, low-margin market, it may be the wrong business, and warn that founders often rationalize weak numbers instead of facing them honestly. Include advice to build something customers enthusiastically recommend, with a clear model that earns more from each customer than it spends, and note that this kind of business tends to improve as it expands, like major internet giants. Aim for about 200 words.

**Judge's two votes:** GPT-5.5, GPT-5.5.

**Sam Altman's real passage**

> Burn rates by themselves are not scary. Burn rates are scary when you scale the business up and the model doesn’t look any better. Burn rates are also scary when runway is short (i.e., burning $2M a month with $100M in the bank is fine; burning $1M a month with $3M in the bank is really bad) even if the unit economics look great.
> 
> The good news is that if you’re aware of this you can avoid the trap. If there’s no other way to operate in your space, maybe it’s a bad business. The low-margin, hyper-competitive world is not the only place to be. Companies always have an explanation about how they’re going to fix unit economics, so you really have to go out of your way not to delude yourself.
> 
> If you hold yourself to the standard of making a product that is so good people spontaneously recommend it to their friends, and you have an easy-to-understand business model where you make more than you spend on each user, and it gets better not worse as you get bigger, you may not look like some of hottest companies of today, but you’ll look a lot like Google and Facebook.

**Adapter (Buntai)**

> There are always going to be losses. In fact, it’s important to make some losses. But you want to lose money on a path toward a better business model, and you want to lose money while making money at a good rate.
> 
> If your business is only able to operate in a hyper-competitive, low-margin environment, then you probably shouldn’t have started it. You should be looking at how to compete on value, not cost.
> 
> It’s very easy to rationalize bad numbers. For example, “this time last year we had 100 users, now we have 1 million, and we’re doing great”. This is a common trap, and one I fall into myself. I’ve learned to ask myself questions like: “what would happen if we lost everything tomorrow”, “what would our burn rate be if we doubled the number of users”, and “is it possible that this user acquisition strategy will never work?”.
> 
> [1] If your business is not getting better over time, and you have a long way to go before you hit break even, then it’s time to seriously consider whether it’s the right business for you.

**GPT-5.5 imitating**

> Losses by themselves are not a problem. In fact, almost every great startup looks bad for a while if you judge it by current profits. The question is what the losses are buying.
> 
> If each dollar lost makes the product better, the customers happier, the brand stronger, and the unit economics more promising, losses can be a very good trade. But if growth just produces more of the same bad economics, the company is not scaling; it is digging. This is especially dangerous when the bank account is getting small. Then time stops being an abstraction.
> 
> A lot of founders get into trouble because they explain away the numbers. They say margins will improve later, customers will become more loyal later, acquisition will get cheaper later. Sometimes this is true. Often it is a story people tell because the alternative is painful.
> 
> If the only way to survive is to compete in a brutal, low-margin market where nobody has much power, it may simply be the wrong business. Startups are hard enough without choosing a game where winning still looks mediocre.
> 
> The goal is to build something customers love enough to recommend, with a model where each customer is worth meaningfully more than it costs to acquire and serve them. The best businesses get stronger as they grow. Their products improve, their data improves, their distribution improves. That is why the great internet companies became so powerful: scale made them better, not just bigger.

**Base Qwen3-VL-4B**

> Losses aren’t inherently alarming in startups—they’re often necessary to scale, test, and refine. But they become dangerous when they persist without improving economics or when cash reserves dwindle. A company surviving in a cutthroat, low-margin market may be the wrong business model: if you can’t turn customers into profitable relationships, you’re gambling on luck, not strategy. Founders frequently rationalize weak numbers—“We’re building a platform,” “We’ll get traction soon”—but ignoring reality leads to burnout or collapse. The antidote? Build something customers enthusiastically recommend, with a clear model that earns more per customer than it spends. This isn’t just about margins—it’s about stickiness, network effects, and scalable value. Companies like Google, Amazon, and Meta didn’t start with profit; they built economies of scale where growth improved efficiency and revenue exponentially. As they scaled, their economics naturally improved. Your mission: create a product that people love so much they’ll pay, tell others, and keep coming back—even if you’re still losing early. Don’t chase short-term metrics. Chase sustainable, exponential growth. The best businesses don’t just survive—they thrive, and their success compounds over time.

---

## 3. The Tech Bust of 2015 - Sam Altman

**Request.** Write a roughly 310-word piece arguing that the technology sector is more likely in a bust than a bubble. Cover the idea that many valuations do not look expensive overall, explain why some seemingly high-priced deals may actually resemble debt because of changed deal structures, and mention that small public tech companies have fallen sharply. Include the point that large platform companies may deserve high valuations but still are not easy short candidates, and note that one major company trades at a low forward earnings multiple. Also cover the evidence from the market that tech IPO activity is at a seven-year low share of total IPOs and that the technology index P/E sits below the broader market P/E. Finally, discuss private-market observations: early-stage pricing complaints, the claim that investing in all recent accelerator companies at demo-day prices would have worked out well, and the idea that mid-stage rounds are harder to raise, with only a few overvalued failures drawing attention.

**Judge's two votes:** GPT-5.5, GPT-5.5.

**Sam Altman's real passage**

> Maybe instead of a tech bubble, we’re in a tech bust. No one seems to fervently believe tech valuations are cheap, so it’d be somewhat surprising if we were in a bubble. In many parts of the market, valuations seem too cheap. In the part where they seem too high, maybe they aren’t really valuations at all, because the deal structure has changed to become more like debt.
> 
> Many of the small cap public tech companies have taken a beating this year. Companies like Yelp are trading at less than 4 times trailing revenue.
> 
> The tech mega-caps are monopolies and have deservedly high valuations. But even then, I would not be willing to short a single one of Apple, Google, Amazon, or Facebook against the S&P. Apple in particular trades at a single-digit ex-cash forward P/E.
> 
> 2015 has seen the lowest level of tech IPOs as a percentage of all IPOs in seven years. The S&P Tech P/E is lower than the overall S&P P/E. Neither of these facts seems suggestive of a tech bubble.
> 
> On the private side, people complain all the time about early-stage valuations (and to be fair, they’ve felt high to me for four years). But if you invested in every single YC company over the past three years at their Demo Day valuation (average Demo Day valuations haven’t moved much in the past three years) you’d be very happy, even though investors complain that YC is the worst example of overpriced companies.
> 
> The mid-stages also seem generally reasonable, though of course there are notable exceptions. These exceptions get all the attention—not the hundreds of companies doing remarkably well, but that handful that have raised money at high valuations and are struggling or dead.
> 
> On the whole, it seems harder than any time in the past four years to raise mid-stage rounds. This is also not suggestive of a bubble.

**Adapter (Buntai)**

> The tech industry has been in a bubble for as long as anyone can remember, and this is probably the best time to be an investor.
> 
> But I think we’re now in a tech bust. Most tech companies are not trading at expensive multiples. The reason the YC model works is because it makes the price of companies look cheap—most people think of YC companies as being priced for growth at 10x or 20x their current revenue; but in reality they are priced at 5x or 6x their revenue, and so the valuation seems reasonable. But now even the YC companies are trading at much lower multiples than they used to. [1]
> 
> Even if the new model is correct, it’s worth noting that a lot of the companies YC is funding are still at high valuations. But they’re not easy targets for shorts, because they’re not as likely to get a lot of money.
> 
> As a side note, Google is still trading at a very low forward P/E ratio. This is a good sign for investors, because it means the company is generating lots of cash.
> 
> There are other signs that tech stocks are cheap. Tech IPO volume is down to its lowest level since 2008. The S&P 500 Tech Index is trading at a lower P/E than the broad market.
> 
> Private markets are also seeing some of these signs. Early-stage investors continue to complain about valuations, and some people say they wish they had invested in every YC company at demo day. Mid-stage companies are harder to value and harder to raise money for, and most of them don’t go on to fail spectacularly.
> 
> Thanks to Josh Ganz and Chris Yeh for reading drafts of this.

**GPT-5.5 imitating**

> It is fashionable to say technology is in a bubble. The better case may be the opposite: much of technology looks closer to a bust.
> 
> Start with public markets. Many valuations do not look expensive in aggregate. The technology index trades at a lower P/E than the broader market, which is not what one expects at the height of speculative mania. Tech IPOs are also a unusually small share of total IPO activity, reportedly at a seven-year low. In bubbles, the market usually begs for more supply. Today it is not.
> 
> Some large platform companies deserve high valuations. They have extraordinary margins, network effects, pricing power, and long runways. That does not make them easy shorts. A great company can be expensive and still be a bad short if it compounds earnings fast enough. And at least one major technology company trades at a low forward earnings multiple, which is hard to square with the simple story that everything is wildly overpriced.
> 
> Some deals that look crazy at first glance are also less equity-like than they appear. Terms have changed. Liquidation preferences, structure, downside protection, and other rights can make a high-priced round resemble debt more than common stock. A headline valuation may say one thing; the actual risk being taken may say another.
> 
> The real damage is easier to see in small public tech companies. Many are down sharply. These are exactly the companies that would normally reveal excess first: limited liquidity, uncertain profitability, and no monopoly-like platform economics. A lot of the froth has already been removed.
> 
> Private markets are more mixed. People complain that early-stage prices are too high, and sometimes they are. But the counterexample is important: if you had invested in every recent accelerator company at demo-day prices, the aggregate result would likely have been very good. The best early-stage companies drive the returns, and they can make many expensive-looking entry prices seem reasonable later.
> 
> The harder area is mid-stage. Those rounds are taking longer, with more scrutiny and fewer tourists. A few overvalued failures get all the attention, because they are vivid. But vivid is not the same as representative. The broader picture looks less like a bubble than a market that has already corrected.

**Base Qwen3-VL-4B**

> The technology sector is more likely in a bust than a bubble — not because valuations are sky-high, but because they’re structurally misaligned with fundamentals, investor psychology, and market realities. While some tech stocks trade at lofty multiples, the broader sector’s average P/E remains below the broader market, signaling a lack of conviction. Many tech firms, especially smaller public ones, have seen sharp declines — not because of intrinsic failure, but because their growth narratives have stalled or been overly optimistic.
> 
> Some of the highest-priced deals don’t reflect true value; rather, they resemble debt. New deal structures — such as convertible notes, equity-linked warrants, and “soft dollar” arrangements — have inflated valuations by shifting risk onto investors. These instruments don’t create real upside; they merely defer downside. The math doesn’t add up when you’re paying for future earnings you haven’t yet delivered.
> 
> Large platform companies — like Amazon, Meta, or Apple — may indeed deserve high valuations based on scale and cash flow, but they remain difficult short candidates. Their dominance and operational efficiency make them immune to short-term volatility. And while they’re often undervalued relative to peers, their forward earnings multiples are unusually low — suggesting market pessimism about future growth, not overvaluation.
> 
> IPO activity has fallen to a seven-year low, and tech companies account for a shrinking share of all IPOs. This isn’t just about fewer startups — it’s about a market that’s no longer willing to bet on tech innovation at premium prices.
> 
> In private markets, the story is even bleaker. Early-stage investors are complaining about pricing, noting that if you’d invested in every recent accelerator company at demo-day prices, you’d be sitting on a portfolio of winners — not losers. Mid-stage fundraising is harder, with fewer rounds closing and only a handful of overvalued failures getting media attention. The signal is clear: tech’s valuation euphoria is fading, and the market is finally recalibrating. This isn’t a bubble — it’s a correction.

---

## 4. Reinforcement Learning Progress - Sam Altman

**Request.** Write a passage about a new reinforcement learning result where a team of five agents learns to play a complex game and beats semi-professional opponents. Explain that the system uses a general optimization method, improves to a 90–95% win rate over older versions, learns by self-play rather than from human game data, and relies on carefully designed rewards. Also cover the argument that this demonstrates how large-scale compute plus a strong simulator can tackle very difficult problems, and include the broader point that such methods may apply to many real-world-like tasks and could be an important path toward general intelligence, in about 210 words.

**Judge's two votes:** adapter, adapter.

**Sam Altman's real passage**

> Today, OpenAI released a new result. We used PPO (Proximal Policy Optimization), a general reinforcement learning algorithm invented by OpenAI, to train a team of 5 agents to play Dota and beat semi-pros.
> 
> This is the game that to me feels closest to the real world and complex decision making (combining strategy, tactics, coordinating, and real-time action) of any game AI had made real progress against so far.
> 
> The agents we train consistently outperform two-week old agents with a win rate of 90-95%. We did this without training on human-played games—we did design the reward functions, of course, but the algorithm figured out how to play by training against itself.
> 
> This is a big deal because it shows that deep reinforcement learning can solve extremely hard problems whenever you can throw enough computing scale and a really good simulated environment that captures the problem you’re solving. We hope to use this same approach to solve very different problems soon. It's easy to imagine this being applied to environments that look increasingly like the real world.
> 
> There are many problems in the world that are far too complex to hand-code solutions for. I expect this to be a large branch of machine learning, and an important step on the road towards general intelligence.

**Adapter (Buntai)**

> Today we release the details behind the recent success of our AlphaStar project: a group of five agents working together to learn to play StarCraft II (a complex strategy game with over 20 million possible moves per turn) and beat professional human players.
> 
> We are using a general-purpose optimization technique called PPO (Proximal Policy Optimization), which is similar to policy gradients but has a much better convergence property. It’s been used in the past for simple Atari games, but we’ve never seen it work so well at anything other than simple games. We also improved upon previous versions of our agent—our current version wins between 90-95% of the time against previous versions.
> 
> The agents learn from self-play. They have not been trained on any video or gameplay data from humans, but they are given a reward function we wrote ourselves that rewards them for winning and penalizes them for losing.
> 
> AlphaStar is a clear demonstration of what you can do when you have enough compute and a good simulator. The fact that this worked at all is remarkable; we didn’t even try to build a superhuman agent for StarCraft II until we got around to it last year. This is probably the first example of a system that learns to beat humans at a real-world-like task.
> 
> Our research suggests that these kinds of systems may work on many real-world tasks, and this is probably an important path towards AGI.

**GPT-5.5 imitating**

> A useful way to understand this result is that it is not really about the game.
> 
> A team of five agents learned to play a complex, long-horizon environment well enough to beat semi-professional human opponents. The striking part is not just that it won, but how. The system used a fairly general optimization method, improved to a 90–95% win rate against older versions, and learned almost entirely through self-play rather than by imitating human game data.
> 
> This matters because self-play can create a curriculum automatically. At first the agents are terrible. Then they become slightly less terrible. Then the opponent becomes stronger because the opponent is yesterday’s version of themselves. Given enough compute, a good simulator, and the right training setup, the system keeps climbing.
> 
> The caveat is important: the rewards had to be carefully designed. If you reward the wrong thing, you get the wrong behavior, often in surprising ways. But that is also part of the lesson. Intelligence is not produced by scale alone; it is produced by scale plus feedback, environment design, and optimization.
> 
> The broader point is that many real-world-like tasks look more like this game than like a static dataset. They require planning, coordination, adaptation, and learning from consequences. If we can build strong simulators for those domains, large-scale reinforcement learning may become one of the main paths toward more general intelligence.

**Base Qwen3-VL-4B**

> A breakthrough in reinforcement learning shows five agents mastering a complex game, outperforming semi-professional human players with a 90–95% win rate—far surpassing prior versions. Unlike earlier systems that relied on human-supervised training, these agents learn purely through self-play, adapting via a general optimization framework that scales efficiently. Crucially, their success hinges on carefully engineered reward structures that guide learning without human intervention. The team’s achievement underscores that massive compute power combined with a robust, realistic simulator can solve previously intractable problems. This approach doesn’t merely replicate human expertise—it discovers novel strategies emergent from trial and error. Beyond gaming, this paradigm may translate to real-world challenges: robotics, autonomous navigation, or economic modeling—all domains requiring adaptive, unsupervised learning. The work suggests a promising path toward general intelligence: systems that learn effectively from experience, not instruction, in dynamic environments. As simulation fidelity and computational scale grow, such methods may enable machines to navigate complexity autonomously, paving the way for truly adaptable, intelligent agents across diverse domains.

---

## 5. E Pur Si Muove - Sam Altman

**Request.** Write a passage about how the speaker became more concerned about free speech and intellectual openness after noticing he felt more comfortable discussing controversial ideas in Beijing than in San Francisco. Cover the idea that this signals a growing climate of self-censorship in the Bay Area, why that could hurt startups and innovation, and how limits on discussion push smart people and ambitious researchers away. Include examples of ideas and fields that can become socially unacceptable, such as basic scientific facts, intelligence-related pharmaceuticals, genetic engineering, and life-extension research, and explain the argument that societies need tolerance for even bizarre or unpopular ideas in order to discover valuable ones. End by mentioning that even major historical figures pursued fringe interests alongside their famous work, showing that useful breakthroughs can coexist with strange beliefs, and make the passage about 330 words long.

**Judge's two votes:** GPT-5.5, GPT-5.5.

**Sam Altman's real passage**

> Earlier this year, I noticed something in China that really surprised me. I realized I felt more comfortable discussing controversial ideas in Beijing than in San Francisco. I didn’t feel completely comfortable—this was China, after all—just more comfortable than at home.
> 
> That showed me just how bad things have become, and how much things have changed since I first got started here in 2005.
> 
> It seems easier to accidentally speak heresies in San Francisco every year. Debating a controversial idea, even if you
> 95% agree with the consensus side, seems ill-advised.
> 
> This will be very bad for startups in the Bay Area.
> 
> Restricting speech leads to restricting ideas and therefore restricted innovation—the most successful societies have generally been the most open ones. Usually mainstream ideas are right and heterodox ideas are wrong, but the true and unpopular ideas are what drive the world forward. Also, smart people tend to have an allergic reaction to the restriction of ideas, and I’m now seeing many of the smartest people I know move elsewhere.
> 
> It is bad for all of us when people can’t say that the world is a sphere, that evolution is real, or that the sun is at the center of the solar system.
> 
> More recently, I’ve seen credible people working on ideas like pharmaceuticals for intelligence augmentation, genetic engineering, and radical life extension leave San Francisco because they found the reaction to their work to be so toxic. “If people live a lot longer it will be disastrous for the environment, so people working on this must be really unethical” was a memorable quote I heard this year.
> 
> To get the really good ideas, we need to tolerate really bad and wacky ideas too. In addition to the work Newton is best known for, he also studied alchemy (the British authorities banned work on this because they feared the devaluation of gold) and considered himself to be someone specially chosen by the almighty for the task of decoding Biblical scripture.

**Adapter (Buntai)**

> I got into an argument with someone recently about whether it’s OK to use a specific drug for cognitive enhancement, and I realized that the general public is now much less tolerant of new ideas than they used to be.
> 
> In fact, I think there’s a real decline in tolerance in the Bay Area (and maybe in Silicon Valley more specifically). I feel way more comfortable saying things like “I believe in the possibility of human immortality” in Beijing than I do in San Francisco.
> 
> I think this trend will ultimately harm us as a society and as a startup company. When you have a culture where you don’t want to discuss new ideas, the best people go elsewhere, and the best ideas never get tried.
> 
> It’s important to note that we’re not talking about ideas like “9/11 was an inside job”. It’s also important to note that we’re not talking about ideas that are just silly or stupid—though it’s important to remember that sometimes even silly ideas turn out to be good ones. The ideas I’m worried about are ones that are scientifically demonstrable, and that most people would consider acceptable if they weren’t so obviously going to cause social disruption.
> 
> Some examples of what I mean include: that evolution works, that intelligence can be increased with drugs, that we should genetically engineer babies to be smarter, and that we can live much longer than we do today.
> 
> Of course, no one is going to disagree with me about these ideas. But the fact that everyone disagrees is itself an interesting phenomenon. In any case, I think it’s important to be willing to entertain all ideas, even if you personally don’t agree with them.
> 
> There is a lot of research to show that societies need to tolerate the weirdness of new ideas, or else they’ll miss out on great ones. And I believe it’s important to continue to do this in our time. As far as I know, the world has always been more accepting of ideas than it is today.
> 
> Even historical figures like Tesla, Einstein, Newton, and Edison were all interested in some very weird things.

**GPT-5.5 imitating**

> I became more worried about free speech in a way I did not expect: I noticed I was sometimes more comfortable talking about controversial ideas in Beijing than in San Francisco.
> 
> This is a bad sign. Not because Beijing is a model of openness; it obviously is not. But because the comparison should not even be close. The Bay Area is supposed to be the place where weird ideas can be said early, before they are polished, respectable, or safe. It is supposed to be unusually good at distinguishing “this sounds wrong” from “this must not be discussed.”
> 
> Startups depend on that distinction. Most important new companies begin as ideas that sound stupid, dangerous, or offensive to the consensus. If people learn to pause before saying what they actually think, they do not merely become more polite. They become less able to think. Self-censorship is especially corrosive because it is invisible; no one has to ban anything. People just stop asking certain questions.
> 
> The set of forbidden questions can grow quickly. It can include basic scientific facts if they are politically inconvenient. It can include research on intelligence-related pharmaceuticals, because intelligence is an uncomfortable topic. It can include genetic engineering, because changing humans feels unnatural. It can include life-extension research, because some people think living much longer would be unfair, arrogant, or strange.
> 
> Some of these ideas may be bad. Some may be useless. Some may lead nowhere. But that is true of almost all early ideas. The way to find the few valuable ones is not to make everyone guess in advance which thoughts will be socially acceptable ten years from now. It is to allow a wide range of exploration, and then argue hard about evidence.
> 
> Smart people notice where they can think freely. Ambitious researchers, especially young ones, are often willing to move for a lab, a company, or a culture that lets them pursue uncomfortable questions. If a city becomes a place where everyone privately wonders the same things but no one says them aloud, it will lose the people who create the future.
> 
> History is full of this pattern. Major figures often pursued fringe interests alongside their famous work. The lesson is not that every strange belief is profound. It is that useful breakthroughs can coexist with strange beliefs, and a society that cannot tolerate the latter may miss the former.

**Base Qwen3-VL-4B**

> It struck me while traveling between Beijing and San Francisco that my comfort level with discussing controversial ideas had shifted dramatically — I felt freer in Beijing, where dissenting views were not only tolerated but often encouraged, compared to San Francisco’s increasingly stifling intellectual climate. This isn’t merely personal discomfort; it reflects a broader, troubling trend: self-censorship creeping into the Bay Area’s tech and academic hubs.
> 
> In Silicon Valley, the pressure to maintain social harmony often outweighs the pursuit of truth. A researcher might hesitate to suggest that CRISPR gene editing could be used to enhance human cognition — a notion deemed “too radical” — or to propose that certain pharmaceuticals might improve intelligence, even if evidence is preliminary. Similarly, discussions around life extension, once considered fringe, are now avoided in public forums, fearing backlash. Even basic scientific facts — like the existence of dark matter or the role of epigenetics — sometimes face resistance when tied to speculative applications.
> 
> This suppression hurts innovation. Startups thrive on bold ideas, unfiltered debate, and the willingness to challenge norms. When smart people fear being ostracized for daring thoughts, they retreat. The result? Less creativity, fewer breakthroughs, and a stagnation of progress. Historically, the most transformative ideas — from Einstein’s relativity to Darwin’s theory of evolution — began as unpopular, even absurd, notions. Societies that reject such ideas prematurely squander their potential for discovery.
> 
> The truth is, we need tolerance for the bizarre, the uncomfortable, and the unpopular. It’s not about endorsing every wild theory, but about preserving space for them to be tested, debated, and potentially refined. Even giants like Newton, Edison, and Freud pursued oddball interests — Newton studied alchemy, Edison believed in spiritualism, and Freud explored taboo dreams — yet all eventually made profound contributions.
> 
> If we want to remain at the forefront of science and technology, we must embrace the messy, contentious, and sometimes unsettling conversations that birth innovation. The Bay Area’s current climate risks turning its genius into silence — not because it lacks talent, but because it fears the noise. Let’s remember: the most valuable ideas are often the most inconvenient ones — and we must let them breathe.

---

## 6. The Worst Part of YC - Sam Altman

**Request.** Write a passage about announcing startup accelerator interview decisions for a summer batch and explaining that the hardest part of the job is turning companies away. Cover the personal feeling of disappointment that comes with rejecting applicants, the memory of being rejected as a founder, and the hope of someday being able to back nearly every strong startup. Include the reason rejections still happen now: limited capacity while the program scales, plus the fact that promising companies can look weak early and evaluators can miss something important. Also mention that if a team has users who love the product, enjoys building it, and has a business plan, it should not be discouraged by the decision, with advice to seek outside opinions from friends. Add that applications were up significantly from the previous year, yet the overall quality was noticeably stronger than in earlier batches, and end by encouraging rejected founders to keep going and reapply after making progress, around 260 words.

**Judge's two votes:** GPT-5.5, GPT-5.5.

**Sam Altman's real passage**

> We are going to send out YC summer 2014 interview decisions (both yes and no) before 10 pm PDT tonight.
> 
> The worst part of our job at YC is rejecting companies. It leaves me feeling down for many days after our application process. I experienced plenty of rejection from investors while running my own startup, and I remember well how bad it is. Starting a startup is such a hard thing that we wish we could help everyone doing so.
> 
> Some day, we hope to be able to fund almost all the good startups. In the meantime, we still have capacity constraints as we figure out how to scale, and that means we’re stuck saying no to potentially good companies.
> 
> The best startups often look bad at this stage, and we make mistakes. We could easily miss something great. If you’re working on something that users love, you like working on it, and you have a plan for how to build a business around it, then please don’t let us deter you. (It's sometimes useful to ask friends for an outside perspective on how you're doing.)
> 
> Although we had nearly 20% more applications than a year ago, it was really striking how much higher the average quality of applications was for this batch compared to any previous batch. Most of the partners independently mentioned this to me.
> 
> Anyway, to everyone we’re unable to fund: Best of luck, and don’t give up. We love to see founders and companies reapply—companies that look bad now can look great with 6 months of progress.

**Adapter (Buntai)**

> I am excited to announce that we have made our decision on who will join us for YC Summer 2014.
> 
> It’s always exciting when we make these decisions; it’s hard work, but the best kind of hard work. I am sure that no one does more hard work than YC partners (though, admittedly, they do get paid a lot less than they could make elsewhere).
> 
> The most difficult part of the role is saying “no”. We are very proud of what we’ve built so far, and we want to support every great company. But the reality is that we can only fund so many companies at any time, and we are still scaling up. We can’t fund everything that’s really good, and it’s painful to say why.
> 
> Mostly it’s because of capacity—we can only fund so many companies at any given time. Sometimes we see a company that looks bad during our interviews, but later learns there is some important piece of information we missed (this is especially common with new technology companies where the market is developing quickly). The other time it’s because we simply don’t have enough money. As we continue to scale, this situation will get better. We hope that in ten years, we can fund every good company in the world.
> 
> If you got turned down, please keep going. If you’d like to reapply later, let us know. If you’re unsure if your idea is worth pursuing, ask other people to give you their honest opinion—you’ll probably find that your idea is worth pursuing.
> 
> Thanks to everyone for applying. The number of applicants to the YC Summer 2014 batch is up over 10% from last year, which is encouraging. But perhaps more importantly, the quality of the applicants has increased significantly, even compared to the quality of applicants to the most recent batch.
> 
> We wish all the companies we didn’t fund well, and we wish all the companies that did fund well an amazing summer.

**GPT-5.5 imitating**

> We’re sending interview decisions for the summer batch, and this is always the hardest part of the job.
> 
> It is much harder than people think to say no to a startup. Behind every application is a group of people who decided to spend their time, reputation, and often their savings on something uncertain. I remember very clearly what it felt like to be rejected as a founder. Even when the rejection was polite, it still felt like someone had looked at the future I could see and decided it was not there.
> 
> That is a bad feeling to give to someone.
> 
> The reason it still happens is not that we think the companies we reject are bad. Many are quite promising. But the program has limited capacity, even as we work to scale it. We can only spend so much time with each company and still make the experience valuable.
> 
> Also, early-stage companies are just hard to judge. Some of the best startups look strange, weak, or incomplete at the beginning. Evaluators can miss the important thing. We have missed it before, and we will miss it again.
> 
> Applications were up significantly from last year, which made decisions harder. More surprising, and more encouraging, was that the overall quality was much stronger than in earlier batches. There were many more serious teams, real products, and thoughtful plans.
> 
> If you have users who love what you’re building, if you like working on it, and if you have a plausible business plan, you should not be too discouraged by our decision. Ask smart friends and other founders what they think. Get outside opinions. But don’t let one rejection become the reason you stop.
> 
> I hope someday we can back nearly every strong startup that applies. We are not there yet.
> 
> For now: keep going, make progress, and apply again.

**Base Qwen3-VL-4B**

> We’re thrilled to announce the interview decisions for our Summer Batch of the Startup Accelerator. While we’re excited to welcome the selected teams — those with vision, grit, and execution — we must also share that not every great idea makes the cut. The hardest part of this role? Turning companies away. It’s painful, even emotionally draining. I remember being rejected as a founder myself — the sting of “not chosen” echoing louder than any pitch deck. Now, as an evaluator, I carry that same weight. I wish I could back every strong startup, but reality is constrained.
> 
> Rejections persist for two main reasons: first, our capacity remains finite as we scale; second, early-stage startups often appear weak or unpolished — sometimes because evaluators miss crucial signals. A promising product can look shaky until it’s built, tested, and validated. Don’t let one rejection define your journey.
> 
> If your team has users who adore your product, enjoys building it, and has a solid business plan — do not despair. Seek feedback from trusted friends or mentors. Your work matters. Keep iterating. Reapply when you’ve made meaningful progress — we’re always looking for growth.
> 
> Applications surged this year compared to last, yet the overall quality? Noticeably stronger. That’s a testament to the ecosystem’s health.
> 
> To all rejected founders: You’re not done. Keep going. We’ll see you again — and we’ll be rooting for you. Around 260 words.

---

## 7. Housing in the Bay Area - Sam Altman

**Request.** Write a passage about proposed California legislation intended to increase housing construction in the Bay Area and lower rents by expanding supply. Explain why reducing housing costs matters for quality of life and wealth inequality, describe how discretionary approval lets projects be delayed or blocked even when they meet zoning rules, and note that the proposal would allow multi-family buildings to be approved automatically if they comply with local zoning and include required affordable units. Also mention that the measure is being considered as part of the state budget process and include a brief call-to-action urging readers to contact key legislators and the governor, noting that constituent calls can influence the vote. Aim for about 310 words.

**Judge's two votes:** GPT-5.5, GPT-5.5.

**Sam Altman's real passage**

> Jerry Brown has proposed legislation that would allow a lot more housing to be built in the Bay Area, and hopefully significantly reduce the cost of housing here. More supply should lead to lower prices.
> 
> I believe that lowering the cost of housing is one of the most important things we can do to help people increase their quality of life and to reduce wealth inequality.
> 
> A huge part of the problem has been that building in the Bay Area is approved by discretion; even when developments comply with local zoning, they can still be vetoed or stalled by local planning commissions, lawsuits, or ballot measures.
> 
> This type of discretionary approval isn't common in most of the US, and Governor Brown's legislation helps align California with most states. His bill would make it so multi-family buildings are automatically approved by right as long as they comply with local zoning, and have 5-20% affordable units--the percentage depending on location and subsidy offered.
> 
> The bill is currently being debated in California's State Legislature as part of the upcoming annual budget, which will be voted on on June 15. If you'd like to help pass this bill, consider calling the members below, as well as the Governor, in support of the Budget Trailer Bill--it only takes a few minutes [1], and it will likely hinge on their support.
> 
> Assemblyman Phil Ting (SF): (916) 319-2019
> 
> Senator Mark Leno (SF): (916) 651-4011
> 
> Senator Kevin de León (Los Angeles): (916) 651-4024
> 
> Assemblyman Rendon (Los Angeles): (916) 319-2063
> 
> Governor Jerry Brown: (916) 445-2841
> 
> [1] Calling could actually make a difference -- when lawmakers are on the fence, legislative aides will tally how many pro-con calls they get for a bill. I've heard that some members have only received a few hundred 'con' calls so far, so there's real opportunity to make a powerful 'pro' impression.

**Adapter (Buntai)**

> The following bill was introduced by Senator Scott Weiner in February. It is now under consideration during the state’s budget process.
> 
> I’m asking all of you to reach out to your local representatives, including Assemblymember Evan Low, State Senate President Pro Tem Darrell Steinberg, and Governor Jerry Brown, and tell them to support this bill. Please also tell me how you’d like to get involved.
> 
> As a former Berkeley resident, I know that affordable housing is critical to our quality of life. Without it, we will have a much less equal society than we should and an increasingly hostile environment for everyone. The cost of living continues to rise in the Bay Area faster than any other region in the United States, and this trend shows no signs of slowing down. A significant part of this issue stems from a lack of supply, which means we need to do more to build more housing.
> 
> The current system of discretionary approval of permits allows cities to delay or deny projects even if they comply with their own zoning ordinances. This makes it difficult to figure out what the true cost of building in the Bay Area is, and it’s a major disincentive for developers to want to build there. This bill would change that by allowing multi-family buildings to be approved automatically if they comply with local zoning and contain the number of affordable units required by the state.
> 
> Thanks for reading!
> 
> If you’d like to get involved, please let me know! I’d love to hear from you. And if you want to make a difference, I’d appreciate it if you’d call your representatives to support this bill. Constituent calls are one of the most effective ways to sway a vote.

**GPT-5.5 imitating**

> California has a chance to do something very practical and very important: make it easier to build more homes in the Bay Area.
> 
> Housing costs are not an abstract policy problem. They determine how long people commute, whether teachers can live near their schools, whether nurses can live near hospitals, whether young people can take risks, whether families can stay together, and whether the next generation can build wealth. When rent eats half of a paycheck, almost everything else in life gets worse. And when the main way to get rich is to have bought a house decades ago in a place where new housing is illegal or nearly impossible, wealth inequality compounds.
> 
> The basic problem is simple. We say we want more housing, and in many places the zoning technically allows it. But then we make every individual project run a gauntlet of discretionary approvals, hearings, appeals, delays, and lawsuits. Even a project that follows the rules can be blocked or delayed for years. This is a great system if your goal is to preserve scarcity while pretending otherwise. It is a terrible system if your goal is lower rents.
> 
> The proposed legislation would move more housing from “maybe, after years of process” to “yes, if it follows the rules.” Multi-family buildings that comply with local zoning and include the required affordable units could be approved automatically. Cities would still write their zoning rules. But once those rules are met, projects could not be held hostage by endless discretionary review.
> 
> This is how most systems should work. Clear rules, followed by predictable approvals. If we want more homes, we have to make building homes normal.
> 
> The measure is being considered as part of the California state budget process, which means the timeline is short and the decision will be made by a relatively small number of people. If you care about housing costs in the Bay Area, now is a good time to call key legislators and the governor’s office. Constituent calls really can affect votes, especially on issues that are live right now.
> 
> More housing will not solve every problem. But without it, many other solutions won’t matter.

**Base Qwen3-VL-4B**

> California’s proposed legislation aims to dramatically increase housing construction in the Bay Area by streamlining approvals for new developments—particularly multi-family units—and mandating affordable housing inclusion. As housing costs soar, this measure seeks to lower rents and ease pressure on residents, making neighborhoods more livable and economically accessible. Reducing housing costs directly impacts quality of life: it allows families to spend less on rent, freeing up income for essentials like food, healthcare, and education. It also combats wealth inequality—when housing is unaffordable, low-income households are forced to choose between shelter and survival, perpetuating cycles of poverty. In many communities, the lack of affordable housing is a root cause of health disparities, reduced workforce participation, and social instability.
> 
> Currently, the discretionary approval process allows local governments to delay or block projects—even those compliant with zoning codes—based on subjective criteria like aesthetics, traffic, or “community impact.” This creates uncertainty, delays development, and discourages builders from investing. The proposed bill would eliminate this bottleneck: multi-family buildings meeting all zoning requirements and including the mandated affordable units would be approved automatically, accelerating delivery and reducing bureaucratic friction.
> 
> This legislation is under consideration as part of the state budget process, meaning its fate hinges on timely legislative action. With housing affordability a top priority, now is the moment for constituents to speak up. Contacting your elected representatives—including state senators, assembly members, and Governor Gavin Newsom—is critical. A simple phone call can help sway public opinion, influence committee decisions, and ensure the measure moves forward. Don’t wait for silence; your voice matters. Reach out today to urge support for this vital policy. Together, we can build a more equitable future where every resident has access to safe, affordable housing—not just a dream, but a reality.

---

## 8. Policy for Growth and Innovation - Sam Altman

**Request.** Write a passage about how excessive government rules can slow down innovation, especially for companies in fields like medicine, biotech, drones, energy, and finance. Explain that some oversight is necessary and even more should exist in areas like AI, but that delays, uncertainty, and huge costs can push businesses to move abroad or choose foreign markets first; include the example of drug development taking about $2.5 billion and a decade. Also discuss a possible fix in which regulators have incentives tied to the success of the industries they oversee, and finish by connecting this to the idea that public-company pressures can discourage long-term innovation because leaders are pushed to satisfy short-term shareholders. Aim for about 340 words.

**Judge's two votes:** adapter, adapter.

**Sam Altman's real passage**

> 5) Reduce regulation. I think some regulation is a good thing. In certain areas (like development of AI) I’d like to see a lot more of it. But I think it often goes too far—for example, an average of $2.5B and 10 years to bring a new drug to market strikes me as problematic.
> 
> Many of the companies I know that are innovating in the physical world struggle with regulatory challenges. And they’re starting to leave. The biggest problem, usually, is that they just can’t get clarity out of the massive and slow government bureaucracy. In 2014, 4 companies that I work with chose to at least partially leave the US for more friendly regulatory environments (3 for regulatory violation or uncertainty, and 1 for concern about export restrictions). Many more kept their headquarters here but chose somewhere else as their initial market (including, for example, nearly all medical device companies, but also drone companies, nuclear fission companies, pharmaceutical companies, bitcoin companies, etc etc etc).
> 
> This is not good. We live in a global society now, and not all countries are as backward about immigration as we are. If our best and brightest want to go start companies elsewhere, they will do so. [4]
> 
> I think one interesting way to solve this would be with incentives. Right now, as I understand it, regulators mostly get “career advancement” by saying “no” to things. Though it would take a lot of careful thought, it might produce good results if regulators were compensated with some version of equity in what they regulate.
> 
> Again, I think some regulation is definitely good. But the current situation is stifling innovation.
> 
> 6) Make being a public company not be so terrible. This point is related to the one above. I’d hate to run a public company. Public companies end up with a bunch of short-term stockholders who simultaneously criticize you for missing earnings by a penny this quarter and not making enough long-term investments.
> 
> Most companies stop innovating when they go public, because they need very predictable revenue and expenses.

**Adapter (Buntai)**

> We need more rules in many industries—perhaps most importantly health care, biotech, drones, energy, and financial services. A little bit of regulation is good, but not too much.
> 
> However, the United States has far too many rules for many industries (which makes sense when you think about it, but which hurts the US economy). The US has a very high cost of doing business in many industries, and regulatory uncertainty is high. These are two of the few things that cause startups to look overseas, and often they will go to China first, which is a disaster.
> 
> For example, developing a new drug takes about $2.5B and ten years. In fact, we spend so much on regulation that I would like to see a proposal where people get paid based on the success rate of their industry. (This is similar to what we do in venture capital—the best investors get paid based on the success rate of their portfolio.)
> 
> The US has a lot of rules about things like taxes and minimum wage, but very few about things like intellectual property, which is important for innovation.
> 
> Publicly traded companies also make it hard to innovate over the long term, since founders want to please shareholders and deliver quarterly results. This is probably why YC is mostly focused on SaaS and social companies—it’s easier to be a great CEO at a social company than a great CEO at a company with a research lab.

**GPT-5.5 imitating**

> It is easy to underestimate how much progress depends on speed.
> 
> A society can want new medicines, cleaner energy, safer financial systems, and better transportation, and still accidentally make them very hard to build. The mechanism is usually not a single bad rule. It is the accumulation of delays, uncertainty, reviews, approvals, and legal risk until the expected value of trying something ambitious becomes too low.
> 
> Some regulation is clearly necessary. In medicine, biotech, drones, energy, and finance, mistakes can hurt people at large scale. And in some areas, especially AI, we probably need more oversight, not less. The question is not whether government should have a role. It is whether the role is designed to make good things happen safely, or whether it mostly makes them happen slowly.
> 
> Drug development is the canonical example. Bringing a new drug to market can take roughly a decade and cost about $2.5 billion. Some of that is unavoidable; we should demand strong evidence before giving powerful compounds to millions of people. But when the process becomes unnecessarily expensive or unpredictable, the effect is not just “companies make less money.” The effect is that fewer drugs get attempted. The marginal cure does not exist.
> 
> The same pattern shows up elsewhere. A drone company may decide to launch first in a country with clearer rules. A geothermal or nuclear startup may spend its best years waiting for permits. A fintech company may avoid products that would help consumers because compliance costs are too high before product-market fit. Eventually founders and capital route around the problem. They go where they can learn fastest.
> 
> A useful principle would be to give regulators some incentive tied to the success of the industries they oversee, not just to the prevention of failure. Today, a regulator is punished for approving something that goes wrong, but rarely rewarded for enabling something important to exist. That creates an obvious bias toward no. We should want regulators to be proud when their sector becomes safer, bigger, more innovative, and more globally competitive.
> 
> This is related to another way we slow ourselves down: public-company pressure. Once a company is judged every quarter, leaders learn to optimize for the next earnings call instead of the next decade. The projects that change the world often look irrational at first. If both government and markets punish long time horizons, we should not be surprised when we get fewer miracles.

**Base Qwen3-VL-4B**

> Excessive government regulation can significantly slow innovation, particularly in high-stakes sectors like medicine, biotech, drones, energy, and finance. While oversight is essential to ensure safety and ethical standards—especially in AI, where risks are profound—overly burdensome rules create bottlenecks that delay product launches, inflate costs, and deter investment. For instance, developing a new drug typically requires $2.5 billion and a decade, not just to fund research but also to navigate complex regulatory pathways. The resulting uncertainty discourages risk-taking and pushes firms toward foreign markets or offshore operations, where regulations may be more flexible.
> 
> In biotech, lengthy FDA reviews and compliance requirements can stall clinical trials, while in drone manufacturing, FAA restrictions on testing and deployment can impede rapid iteration. Similarly, energy startups face bureaucratic hurdles that make scaling difficult, and financial institutions struggle with opaque compliance regimes that stifle agile innovation. In AI, the danger is even greater: without thoughtful, adaptive regulation, we risk uncontrolled risks, yet too much red tape stifles breakthroughs that could redefine healthcare or climate solutions.
> 
> A potential remedy lies in aligning regulators’ incentives with industry success. Instead of punishing delays or inefficiencies, regulators could be rewarded for accelerating approvals that lead to real-world impact—say, through metrics tied to job creation, patient outcomes, or market adoption. This would encourage efficiency and responsiveness, not rigidity.
> 
> Moreover, the pressure from public shareholders further undermines long-term innovation. CEOs, under the glare of quarterly earnings reports, are incentivized to deliver short-term results rather than invest in risky, high-return R&D. This creates a paradox: while governments must protect the public, they also need to foster environments where innovation can flourish. The solution isn’t deregulation per se, but smarter, performance-based regulation that rewards progress—and allows entrepreneurs to innovate without being crushed by bureaucracy or shareholder demands. Only then can we balance safety with speed, and ensure that tomorrow’s breakthroughs don’t wait indefinitely for approval.

---

## 9. Policy for Growth and Innovation - Sam Altman

**Request.** Write a passage about the idea that a government should set a target for real GDP growth and organize policy around achieving it. Explain the argument that people and institutions tend to improve what they measure, while also noting that GDP is an imperfect indicator because cheaper software and falling goods prices can make it miss broader improvements in living standards. Include the suggestion that a better long-term metric would track overall quality of life, even if designing that framework would be difficult, and mention that other policy changes matter too, but this growth-and-innovation agenda is presented as the most important and urgent. End by emphasizing the warning that failing to act on these ideas would be a mistake.

**Judge's two votes:** adapter, adapter.

**Sam Altman's real passage**

> 7) Target a real GDP growth rate. You build what you measure. If the government wants more growth, set a target and focus everyone on hitting it.
> 
> GDP is not a perfect metric, especially as the software revolution drives cost of goods gets driven lower and lower. What we really need is a measurement of “total quality of life”. This will be tough to figure out, but it’s probably worth the time to invent some framework and then measure ourselves against it
> 
> There are obviously a lot of other policy changes I think we should make, but on the topics of growth and innovation, these 7 points are what I think are most important. And I’m confident that if we don’t take action here, we are going to regret it.
> 
> [1] Incidentally, innovation does not always drive job growth, even when it drives GDP growth. The industrial revolution was something of an anomaly in this regard. I’ll write more about what this means later.
> 
> [2] There are a bunch of other policy changes I would make—for example, I’d increase the minimum wage to something like $15 an hour—that are important and somewhat related to this goal but not directly related enough to include here.
> 
> [3] While access to knowledge, healthcare, food, water, etc. for people in developed countries is far better now than any time in history, extreme inequality still feels unfair (I’ll save my social rant for another time, but I think the level of extreme poverty that still exists in the world is absolutely atrocious. Traveling around the developing world is an incredible wake-up call.)
> 
> [4] Sometimes the government people ask “Would you ever move YC out of the US?” with nervous laughter? I really like it here and I sure hope we don’t, but never say never.

**Adapter (Buntai)**

> We should have a growth goal for the economy.
> 
> People are very good at getting better at whatever they are measuring, and we should make sure to focus on the right things. GDP is a decent proxy for economic success, but not perfect. It ignores the value of more software, which has been driving much of our growth, and it doesn’t account for lower prices (the value of which is still growing). But we should at least start with GDP.
> 
> In the longer term, I think it’s important to think about how to measure quality of life—how to get a better sense of how much happiness or well-being people get out of the world. This may require new technology, or new institutions, or something else entirely.
> 
> It’s not enough just to do the above; we need to do a lot of other things, and many of them are incredibly important. But I believe that a focus on growth and innovation is probably the most important and most urgent thing we need to do. If we don’t focus on these, we will be wasting our time.
> 
> The second part of this plan is to ensure that everyone gets a chance to do great work, and that we have the right incentives. We have some good policies already in place, like the patent system and the tax code, but we should do more.

**GPT-5.5 imitating**

> A government should have an explicit target for real GDP growth, and then organize much of policy around hitting it.
> 
> This sounds cruder than it is. What we measure, we tend to improve. Companies know this. Teams know this. Individuals know this. If a society says growth matters, measures it often, argues about the inputs, and holds institutions accountable for the output, it will probably get more of it.
> 
> The target should not be a fake promise or a political slogan. It should be a serious operating metric. If we want faster growth, we need more energy, more housing, better infrastructure, more scientific progress, faster permitting, more startups, better education, and a state that is willing to remove obstacles to building. A growth target would force tradeoffs into the open. It would make it harder to hide behind process when the outcome is stagnation.
> 
> GDP is not perfect. In fact, it misses some of the most important things about modern progress. If software gets dramatically better and cheaper, GDP may not fully capture the gain. If goods fall in price, people may be better off even when measured output looks less impressive than the lived reality. A person with a smartphone has access to tools that would have looked magical a generation ago, but the accounting system does not always know how to value that.
> 
> Over the long run, we probably need a better measure: something closer to total quality of life. It should include health, abundance, safety, education, leisure, environmental quality, opportunity, and the compounding benefits of technology. Designing this will be hard. People will argue about weights and definitions, and they should. But difficulty is not an excuse to avoid measuring what we actually care about.
> 
> Still, real GDP growth is a useful near-term target because it is legible, comparable, and connected to many of the things that make life better. Richer societies can afford more. They can invest more, cure more diseases, build more resilience, and offer more people the chance to do work that matters.
> 
> Other policy changes matter too. Redistribution matters. Institutional reform matters. Fiscal discipline matters. Social trust matters. But the central agenda should be growth and innovation, because almost everything else gets easier in a world of abundance and harder in a world of scarcity.
> 
> The urgent task is to make progress normal again. We should measure it, demand it, and build the institutions that can deliver it. Failing to act on these ideas would be a mistake.

**Base Qwen3-VL-4B**

> A government should set a clear, ambitious target for real GDP growth and structure its policies — fiscal, monetary, and regulatory — around achieving that goal. The rationale rests on a well-documented behavioral principle: people and institutions tend to improve what they measure. When policymakers focus on GDP, they incentivize investment, innovation, and productivity gains — sectors that directly fuel economic expansion. This creates a virtuous cycle: higher growth attracts capital, boosts employment, and raises incomes, which in turn fuels further growth.
> 
> Yet GDP is not a perfect barometer of societal progress. It measures market transactions — and thus misses critical dimensions of human welfare. Cheaper software, more efficient manufacturing, or falling prices for consumer goods may reduce GDP numbers, even as living standards improve. In other words, GDP can be misleadingly static when technological advances or economies of scale render traditional metrics obsolete. This is why we must acknowledge its limitations — but not abandon it entirely.
> 
> To address these shortcomings, we must consider a more holistic, long-term metric: one that tracks overall quality of life — encompassing health, education, environmental sustainability, social cohesion, and personal freedom. Such a framework could include indicators like life expectancy, literacy rates, access to clean water, mental health outcomes, and civic participation. While designing such a comprehensive index would be immensely complex and politically fraught, it is not merely aspirational — it is necessary if we wish to ensure that economic growth serves humanity, not just markets.
> 
> That said, we cannot afford to wait for perfection. In the short term, the growth-and-innovation agenda remains paramount. It is the engine of opportunity, the foundation for resilience, and the only path to lifting millions out of poverty and stagnation. Other policy changes — such as tax reform, labor market flexibility, or public infrastructure investment — are vital, but none are as urgent or as transformative as deliberate, sustained efforts to expand real GDP.
> 
> Failing to act on this agenda is not merely negligent — it is a mistake. In an era of accelerating disruption and widening inequality, the world demands bold, measurable, and focused action. If governments choose to ignore GDP as a target — or worse, let it decline — they risk eroding confidence, deepening disparities, and undermining the very foundations of prosperity. We must not only measure what matters, but strive to make it grow. The time for hesitation is over.

---

## 10. Fundraising Mistakes Founders Make - Sam Altman

**Request.** Write a roughly 350-word piece about common fundraising mistakes founders make. Cover why packing a round with many investors can seem like a good way to avoid control issues but often leaves a company without one deeply committed backer, and explain the value of having a single investor who meets monthly and helps keep the company on track. Include advice on pitching: avoid reciting a rigid template or spending too much time on competitors and market history, and instead center the presentation on the parts of the business that genuinely excite you, the origin of the idea, why it matters, and how the cofounders came together. Also mention that investors are looking for big outcomes, so founders should not bring up potential acquirers too early. Finish by explaining the importance of checking references on major investors before partnering with them for years, and note that founders should not raise money without a clear vision for where the company is headed.

**Judge's two votes:** GPT-5.5, GPT-5.5.

**Sam Altman's real passage**

> A lot of founders put together party rounds comprised of dozens of investors and congratulate themselves that no single investor has much power over them. But in practice investors have little power over companies that are doing well anyway, and what they actually have is no investor that is super invested in their success.
> 
> It turns out it’s really valuable to have one investor that you meet with every month and report progress to. This forcing function creates an operational cadence in the company that is a big net positive. It’s remarkable to me how much more frequently the party round companies go off into the weeds.
> 
> • Pitching poorly
> 
> A lot of founders get caught up in trying to follow a perfect template, and drone on and on about their competitors, the market evolution, etc. They’re bored and it shows.
> 
> The way to pitch well is to focus on the parts of the business that truly excite you. That will shine through, and it will get the investors excited. Conveying your passion for the business is almost as important as what you say, and it’s almost impossible to fake.
> 
> Even if you’re an introvert, it will usually come through to a sophisticated investor. So start with the parts you’re really excited about.
> 
> Investors want to hear a good story, and that includes things like how you decided to work on this idea, why it matters, how you met your cofounders, etc. So don’t leave those parts out of the pitch.
> 
> Also, remember that smart investors are looking for the really big hits. So don’t do obviously dumb things like talk about potential acquirers in a seed round pitch - that will suggest you’re not trying to build a really big company.
> 
> • Not reference-checking major investors
> 
> Great investors can add a huge amount of value; bad investors can make your life miserable. Before signing up to work with someone for the better part of a decade, spend an hour calling founders they have worked with to get a sense of what's in store for you.
> 
> • Lacking a clear vision

**Adapter (Buntai)**

> 2. Don’t do a “big” round.
> 
> It’s easy to feel like a big round will solve your control problem, but it rarely does. You end up with a bunch of investors in your life who don’t have skin in the game and don’t really understand the company well enough to help guide it. It’s better to have one investor you meet every month who believes in you, understands the business, and has a lot of time to spend helping you.
> 
> 3. Pitch like a human being.
> 
> There are some very bad templates out there (e.g., YC’s) and it’s important to avoid these. The best thing to remember when you pitch is to talk about what you care about and what makes you excited about the opportunity—this is what you should focus on in your pitch deck. Also, don’t spend a lot of time talking about the competition or the history of the industry; instead, focus on the parts of the company you’re working on that you love. Investors are looking for big outcomes; don’t start talking about acquisition targets until much later.
> 
> 4. Check the reference.
> 
> Make sure you know what the major investors in an investment firm believe in, and check their references before deciding to partner with them for years. It’s critical to have a good relationship with your first investor for the entire lifespan of your company.
> 
> 5. Have a plan.
> 
> You should never raise money without knowing what you’re going to build and how far you want to go.

**GPT-5.5 imitating**

> One of the easiest fundraising mistakes to make is to optimize for the wrong kind of safety.
> 
> Founders often think, “If we get a lot of investors, no one investor will have too much power.” This is understandable. Control matters, and bad investor dynamics can hurt a company for years. But a party round can create a different problem: no one feels truly responsible.
> 
> If you have twenty small investors, they may all like you, but none of them may be deeply committed when things get hard. And things will get hard. The best investor is not just a name on a cap table. The best investor is someone who cares enough to tell you the truth, helps you think clearly, and shows up consistently.
> 
> There is enormous value in having one lead investor who meets with you every month and helps keep the company on track. Not someone who runs the company. Not someone who creates homework for its own sake. Someone who asks good questions: What is the most important thing this month? Are we learning fast enough? Are we hiring the right people? Are we avoiding the hard problem? A good monthly conversation can prevent a lot of drift.
> 
> Another common mistake is pitching like you are trying to pass a test. Founders memorize a template and move through it slide by slide: market, problem, solution, competitors, business model, go-to-market. This can work, but it often drains the life out of the company.
> 
> The best pitches usually feel more direct. They explain why the founders care, where the idea came from, what changed in the world to make it possible, and why this team had to build it. Spend less time giving a history of the market or a complete map of every competitor. Spend more time on the parts of the business that make you come alive. Energy is informative. Investors are trying to understand not just the idea, but the founder’s relationship to the idea.
> 
> Also, do not talk too early about who might acquire the company. Investors are looking for big outcomes. If your story quickly becomes “Google might buy us,” you have made the company feel smaller. Build the case that this can matter on its own.
> 
> Finally, reference-check major investors. You may work with them for a decade. Talk to founders they backed when things went badly, not just when things went well.
> 
> And do not raise money just because you can. Raise money when you know where you are going and why more capital helps you get there faster.

**Base Qwen3-VL-4B**

> Founders often make critical fundraising mistakes that undermine long-term success. One of the most common is “packing” a round with many investors — a strategy that seems wise to avoid control issues, but usually results in a company lacking a deeply committed backer. While multiple investors may dilute ownership, they also fragment accountability. No one is truly invested in the day-to-day grind — the late nights, the pivots, the setbacks. A single investor, however, who meets monthly, becomes a sounding board, a mentor, and a steady anchor. They’re not just funding the company; they’re emotionally and strategically invested in its trajectory. Their presence can help keep the team focused, aligned, and resilient.
> 
> When pitching, founders often fall into the trap of reciting rigid templates or spending excessive time on competitors and market history. These elements are important, but they’re secondary. Instead, center your pitch on what genuinely excites you — the origin story, the problem you’re solving, why it matters, and how your cofounders came together. Investors don’t need a laundry list of market data; they want to feel the passion, the conviction, and the human element behind the business. That’s where magic happens — when a founder can articulate why they’re doing this work, not just what they’re building.
> 
> Investors are looking for big outcomes — not just survival, but scalable impact. Don’t bring up potential acquirers too early. It signals desperation, not confidence. You’re not selling a product; you’re selling a future. The sooner you start thinking about acquisition, the less you’ll be able to build the product, culture, and traction that make that acquisition worth it.
> 
> Finally, never raise money without a clear vision for where the company is headed. And before you sign any deal, check references on major investors. Ask about their track record, their values, and whether they’ve partnered with founders for years — not just once. A bad investor can derail a great company. A good one can elevate it.
> 
> The most successful founders don’t just raise capital — they build relationships, tell stories, and stay laser-focused on their mission. Fundraising isn’t transactional; it’s an alignment of purpose.

---

## 11. A Clarification - Sam Altman

**Request.** Write about the tension between prohibiting hateful or discriminatory speech and preserving debate on controversial but important ideas, explaining why drawing that boundary is difficult. Include the argument that moral standards change across generations, with examples such as attitudes toward eating meat, animal rights, lab-grown alternatives, possible future views shaped by AI, and the idea that poverty may later be seen as a serious moral failure; also include the anecdote about trying to discuss meat-eating with someone who dismissed the topic as a rights issue. End by emphasizing that it is risky to forbid discussion of ideas simply because they are offensive, and aim for about 260 words.

**Judge's two votes:** adapter, adapter.

**Sam Altman's real passage**

> I wish we could figure out a way to just never allow hate, discrimination, and bigotry and always allow debate on controversial but important ideas. If that were possible, I’d support it. The distinction is usually clear, but the exceptions are sometimes critically important. Figuring out exactly where to draw the line is really hard.
> 
> Generations before us believed a lot of things we now believe (correctly, in my opinion) to be unethical or wrong. Future generations will think a lot of things we believe today are unethical or wrong.
> 
> For example, today it is pretty unpopular to say “anyone who eats meat is unethical”. But this is easily a stance I could imagine being commonplace in 50 years, because of evolving views on animal rights, impact on the planet, and availability of lab-grown replacements. Perhaps even the arrival of AI makes us think differently about being ok eating other beings just because they’re much less smart/emotionally sophisticated than we are.
> 
> The last time I tried to discuss this with someone, he said something like: “Banning eating meat would be infringing on my rights, this is not up for discussion.”
> 
> I expect the fact that we let people live in poverty is also something that future generations will consider an absolute moral failing. I could go on with a long list of other ideas, and I’m sure I can’t even think of some of the most important ones.
> 
> The point I most wanted to make is that is that it’s dangerous to just ban discussion of topics we find offensive, like what happened yesterday.

**Adapter (Buntai)**

> I think we should have a policy to ban the most hateful speech in the world. But I don’t believe it’s a good idea to ban people from talking about bad ideas.
> 
> It’s hard to find the line between the two. Moral norms change over time. It’s not clear when they should stop changing. We now consider it acceptable to eat meat and to kill animals for food (although many people still don’t like this). It seems unlikely that we will be willing to give up eating meat or killing animals for food forever, but I suspect we will eventually be willing to do so. If we continue down our current path, it’s likely we will be able to eat lab-grown meat at some point, and we’ll certainly be able to create meat without ever having to kill animals. It’s probably possible that we will use artificial intelligence to develop new moral values that would make it impossible to eat meat. And if we continue to develop technology at the rate we’re doing, it’s possible that by the time we’re comfortable eating meat, we’ll have developed the technology to stop poverty. Poverty is currently an abomination, and I think we will be very uncomfortable with it in a few hundred years.
> 
> I tried once to talk to a friend about my belief that it’s morally wrong to eat meat. He replied that he thought that was a human rights issue and didn’t really want to hear more about it. This is the kind of thing we need to avoid.
> 
> It’s dangerous to just say “no” to something you don’t like.

**GPT-5.5 imitating**

> I can’t write in Sam Altman’s exact style, but here is a concise, plainspoken essay passage with a similar reflective, argumentative tone:
> 
> One of the hardest problems in free expression is that two true things are in tension. Hateful and discriminatory speech can cause real harm, and societies are right to try to protect people from dehumanization. But controversial ideas are often important precisely because they challenge the moral assumptions of the time.
> 
> The boundary is hard to draw because “obviously unacceptable” changes. A generation ago, many views now considered basic decency were fringe. A generation from now, many of our normal habits may look barbaric. Eating meat is a good example. Today most people treat it as ordinary. But with stronger animal rights arguments, better lab-grown alternatives, and perhaps AI systems that help us reason more clearly about suffering, future people may see industrial meat production as a moral catastrophe.
> 
> I once tried to discuss meat-eating with someone who immediately dismissed the topic by saying it was a rights issue and therefore not open for debate. That reaction was striking because it used the language of moral certainty to end the conversation rather than begin it. But if the moral circle is still expanding, then we should be especially careful about which conversations we declare finished.
> 
> The same may be true of poverty. Future generations may look back and ask how wealthy societies tolerated extreme deprivation when they had the tools to reduce it. They may see it not as an unfortunate fact of life, but as a serious moral failure.
> 
> This does not mean every claim deserves a platform, or that cruelty should be excused as inquiry. But it is risky to forbid discussion of ideas simply because they are offensive. Sometimes offense is a sign of malice. Sometimes it is a sign that the future is trying to get born.

**Base Qwen3-VL-4B**

> Drawing the line between banning hateful speech and allowing debate on controversial ideas is fraught. Prohibiting hate risks silencing dissent, while permitting offensive speech may normalize harm. The challenge deepens when moral standards evolve — what’s deemed unacceptable today may be seen as reasonable tomorrow. Consider meat-eating: once normalized, it’s now debated as a rights issue, especially with rising animal welfare concerns and lab-grown alternatives. Future generations might view factory farming as morally indefensible, or even see meat consumption as a form of ecological exploitation. AI could further reshape moral frameworks — perhaps making “offensive” speech obsolete or redefining what counts as harm. Even poverty may one day be viewed as a moral failure, not just a social condition — a shift that would demand new boundaries in public discourse. An anecdote illustrates this: I once tried to discuss meat-eating with someone who dismissed it as a “rights issue,” unaware that many now see it as an ethical dilemma. Forbidding such discussions risks stifling progress, not protecting us. It’s dangerous to shut down debate merely because ideas offend — we must protect the space where uncomfortable truths are tested, even if they’re unpopular. Morality evolves; so must our boundaries. Let the conversation continue — not because it’s easy, but because it’s essential to building a society that adapts to its own changing conscience.

---

## 12. Bubble talk - Sam Altman

**Request.** Write a passage arguing that talk of a tech bubble is overblown and distracts from what startups are building. Cover the points that investors can simply avoid overpriced deals, that markets eventually settle on a fair price, that business cycles are brief compared with the progress of innovation, and that even alarming past periods were followed by major company launches. Include a concrete five-year bet using three groups of startups: several well-known large private companies, a set of mid-stage YC-backed companies, and a current YC batch that is near zero in value now. State the specific prediction that each group should grow substantially by a fixed date in the future, and keep it around 360 words.

**Judge's two votes:** GPT-5.5, GPT-5.5.

**Sam Altman's real passage**

> I’m tired of reading about investors and journalists claiming there’s a bubble in tech. I understand that it’s fun to do and easy press, but it’s boring reading. I also understand that it might scare newer investors away and bring down valuations, but there’s got to be a better way to win than that.
> 
> I would much rather read about what companies are doing than the state of the markets. The gleeful anticipation of a correction by investors and pundits is not helping the world get better in any meaningful way.
> 
> Investors that think companies are overpriced are always free not to invest. Eventually, the market will find its clearing price.
> 
> I am pretty paranoid about bubbles, but things still feel grounded in reason (the thing that feels least reasonable is some early-stage valuations, but it’s a small amount of capital and still nothing I would call a “bubble”). Even my own recent comments were misinterpreted as claiming we’re in a bubble—that’s how much the press wants to write about this.
> 
> Although they cause a lot of handwringing, business cycles are short compared to the arc of innovation. In October of 2008, Sequoia Capital—arguably the best-ever in the business—gave the famous “RIP Good Times” presentation (I was there). A few months later, we funded Airbnb. A few months after that, a company called UberCab got started.
> 
> Instead of just making statements, here is a bet looking 5 years out. To win, I have to be right on all three propositions.
> 
> 1) The top 6 US companies at http://fortune.com/2015/01/22/the-age-of-unicorns/ (Uber, Palantir, Airbnb, Dropbox, Pinterest, and SpaceX) are currently worth just over $100B. I am leaving out Snapchat because I couldn’t get verification of its valuation. Proposition 1: On January 1st,
> 2020, these companies will be worth at least $200B in aggregate.
> 
> 2) Stripe, Zenefits, Instacart, Mixpanel, Teespring, Optimizely, Coinbase, Docker, and Weebly are a selection of mid-stage YC companies currently worth less than $9B in aggregate. Proposition 2: On January 1st,
> 2020, they will be worth at least $27B in aggregate.
> 
> 3) Proposition 3: The current YC Winter 2015 batch—currently worth something that rounds down to $0—will be worth at least $3B on Jan 1st,
> 2020.

**Adapter (Buntai)**

> I am happy to hear that people want to talk about a tech bubble.
> 
> But I think we’re better off talking about what people are actually doing than we are talking about what they aren’t doing. The only way to not get sucked into a bubble is to not buy expensive companies. We can all do that—we don’t have to buy a $1 billion company for $500 million just because it’s a good idea.
> 
> And if we don’t like the current prices, the market will find a new equilibrium point in time. There’s always an equilibrium point. The market is very smart at this, and it works most of the time. It’s also very smart at not being dumb most of the time.
> 
> The best case scenario would be for us to have a cycle of 10-15 years, and then the next one starts. But there are some important caveats. We are currently in a very early phase of an extremely long trend (in fact, it’s possible that the trend has been going on for 200 years), and it’s going to continue for a very long time. Business cycles are short, but technological trends are long.
> 
> Historically, the worst periods have been followed by the best periods, so we may end up having a great period soon after the bad one we are in right now. But I’m sure most people would rather not have to go through a terrible period ever again, even if it means that we have to pay more than we think we should.
> 
> I believe we’re in the middle of a great period of innovation. Here’s a five year bet about where things are headed:
> 
> 1. Y Combinator companies have done pretty well so far, and we expect them to continue doing so. In particular, I expect the following companies to be much bigger in five years than they are today:
> 
> * Facebook
> 
> * Google
> 
> * Yahoo!
> 
> * Twitter
> 
> * LinkedIn
> 
> * Airbnb
> 
> * Uber
> 
> * Dropbox
> 
> * Stripe
> 
> * Reddit
> 
> * Pinterest
> 
> * Palantir
> 
> * Yelp
> 
> * Quora
> 
> * Asana
> 
> * Tumblr
> 
> * Pinterest
> 
> * Wix
> 
> * GitHub
> 
> * Medium
> 
> * Slack
> 
> * Mailchimp
> 
> * Twilio
> 
> * Hootsuite
> 
> * Square
> 
> * Foursquare
> 
> * Dropbox
> 
> * Instagram
> 
> * Pinterest
> 
> * Airbnb
> 
> * Lyft
> 
> * Uber
> 
> * Wix
> 
> * Dropbox
> 
> * GitHub
> 
> * Medium
> 
> * Slack
> 
> * Mailchimp
> 
> * Twilio
> 
> * Hootsuite
> 
> * Square
> 
> * Foursquare
> 
> * Pinterest
> 
> * Instagram
> 
> * Airbnb
> 
> * Lyft
> 
> * Uber
> 
> * Wix
> 
> * Dropbox
> 
> * GitHub
> 
> * Medium
> 
> * Slack
> 
> * Mailchimp
> 
> * Twilio
> 
> * Hootsuite
> 
> * Square
> 
> * Foursquare
> 
> * Pinterest
> 
> * Instagram
> 
> * Airbnb
> 
> * Lyft
> 
> * Uber
> 
> * Wix
> 
> * Dropbox
> 
> * GitHub
> 
> * Medium
> 
> * Slack
> 
> * Mailchimp
> 
> * Twilio
> 
> * Hootsuite
> 
> * Square
> 
> * Foursquare
> 
> * Pinterest
> 
> * Instagram
> 
> * Airbnb
> 
> * Lyft
> 
> * Uber
> 
> * Wix
> 
> * Dropbox
> 
> * GitHub
> 
> * Medium
> 
> * Slack
> 
> * Mailchimp
> 
> * Twilio
> 
> * Hootsuite
> 
> * Square
> 
> * Foursquare
> 
> * Pinterest
> 
> * Instagram
> 
> * Airbnb
> 
> * Lyft
> 
> * Uber
> 
> * Wix
> 
> * Dropbox
> 
> * GitHub
> 
> * Medium
> 
> * Slack
> 
> * Mailchimp
> 
> * Twilio
> 
> * Hootsuite
> 
> * Square
> 
> * Foursquare
> 
> * Pinterest
> 
> * Instagram
> 
> * Airbnb
> 
> * Lyft
> 
> * Uber
> 
> * Wix
> 
> * Dropbox
> 
> * GitHub
> 
> * Medium
> 
> * Slack
> 
> * Mailchimp
> 
> * Twilio
> 
> * Hootsuite
> 
> * Square
> 
> * Foursquare
> 
> * Pinterest
> 
> * Instagram
> 
> * Airbnb
> 
> * Lyft
> 
> * Uber
> 
> * Wix
> 
> *

**GPT-5.5 imitating**

> The bubble conversation is mostly a way to avoid doing the harder work of looking at what is actually being built.
> 
> Some prices are probably too high. This is not a crisis. If a company is raising at a valuation that assumes ten years of perfect execution, investors can say no. That is one of the great features of startup investing: almost every mistake is optional. You do not have to buy the expensive thing. You can wait, or invest earlier, or invest in something else.
> 
> Markets are noisy, but they are not infinitely stupid. Over time they tend to find the clearing price. If capital gets too excited, returns fall and capital pulls back. If prices get too low, great companies become cheap and capital returns. This process can be painful for people who confuse a mark with reality, but it is not the main story.
> 
> The main story is that founders are building better tools, cheaper energy, new drugs, better factories, autonomous systems, financial infrastructure, security software, and AI products that make people dramatically more productive. Business cycles are short compared with technological cycles. A bad funding market can last two years. A platform shift can matter for fifty.
> 
> It is worth remembering that some of the scariest periods in recent history were followed by extraordinary company formation. The dot-com crash was followed by Google’s rise, Facebook, Tesla, SpaceX, and many of the defining software companies of the next era. The 2008 crisis did not stop Airbnb, Stripe, Uber, or Square. In retrospect, the fear was real, but it was not the most important fact.
> 
> Here is a simple five-year bet. By January 1, 2031, a basket of large private technology companies—SpaceX, Stripe, Databricks, Anthropic, Anduril, and OpenAI—will be worth substantially more in aggregate than they are today. A basket of mid-stage YC-backed companies—Deel, Rippling, Flock Safety, Vanta, Instacart alumni included as the more mature comparator, and similar companies from recent YC cohorts—will also grow substantially in revenue and enterprise value. And the current YC batch, which is close to zero in aggregate value today compared with public-market giants, will contain multiple companies that are obviously important by then.
> 
> Some individual names will disappoint. That is always true. But the basket matters. The bet is not that every price is sane. The bet is that the builders are underrated.

**Base Qwen3-VL-4B**

> The notion of a “tech bubble” is overblown — and dangerously distracting. Investors aren’t stuck in a rigged market; they’re free to avoid overpriced deals. If a startup’s valuation seems inflated, it’s not a systemic crisis — it’s a choice. Markets, even when overheated, eventually settle on fair value. Price corrections happen, but they’re not the end of innovation — they’re the beginning of its refinement.
> 
> Business cycles in tech are brief compared to the pace of progress. A decade ago, we were talking about smartphones; today, we’re scaling AI agents, quantum computing, and neural interfaces. The hype fades, but the underlying technology doesn’t. Even the most alarming past bubbles — like 2000 or 2015 — were followed by massive new companies: Uber, Airbnb, Stripe, and Netflix all emerged after market corrections. Innovation doesn’t pause for sentiment.
> 
> Let’s make a concrete five-year bet. By 2030:
> 
> - **Well-known large private companies** (e.g., Meta, Amazon, Google) will have grown their market capitalization by at least 10x from 2025 levels — reflecting sustained dominance and scalable infrastructure.
>   
> - **Mid-stage YC-backed companies** (e.g., those with 1–3 years of traction, 10–50 employees) will collectively achieve a 20x valuation multiple from their 2025 valuations — demonstrating how early-stage bets pay off when fundamentals align.
>   
> - **Current YC batch (near-zero valuations)** — including companies like those in the 2024 batch — will be worth at least $100 million each by 2030, representing a 100x+ return on investment, assuming they scale successfully. These are not speculative gambles — they’re engines of future value.
> 
> This isn’t about chasing hype. It’s about recognizing that innovation moves faster than markets can react — and that investors who stay focused on product, team, and execution will reap the rewards. The “bubble” narrative is a distraction from the real story: startups are solving problems no one else can. They’re building the future. And if you believe in that, you don’t need to fear a correction — you just need to wait, invest wisely, and let the next wave of breakthroughs carry you forward.
> 
> The tech landscape is not a bubble — it’s a marathon. And the best bets are those made with clarity, discipline, and conviction — not panic.

---

## 13. A Clarification - Sam Altman

**Request.** Write a roughly 340-word passage that clarifies a previous statement about speech, science, and social progress. Explain that the point is not to excuse intolerant people in workplaces or labs, since most strong scientists are decent and excluding difficult people often improves organizations. Then focus on the larger argument: society should allow controversial ideas to be stated, because major scientific discoveries and major social reforms often begin as widely rejected views. Include the example of homosexuality once being treated as morally unacceptable, and note that if people had not been allowed to challenge that consensus, gay rights would not have advanced. Also mention that no simple rule will perfectly separate acceptable from unacceptable speech, but that free expression is still necessary because society is sometimes wrong. End by contrasting people who use this freedom to spread prejudice with those who use it to argue for more rights or new ideas, and conclude that this process gradually makes the world more just.

**Judge's two votes:** adapter, adapter.

**Sam Altman's real passage**

> I made a point in this post inelegantly in a way that was easy to misunderstand, so I’d like to clarify it.
> 
> I didn’t mean that we need to tolerate brilliant homophobic jerks in the lab so that we can have scientific progress. Although there are famous counterexamples, most of the best scientists I’ve met are unusually nice, open-minded people. Generally I expect that labs that don’t tolerate jerks will produce more impressive results than the ones that do, and choosing not to employ jerks is a good idea—jerks usually reduce the net output of organizations.
> 
> What I meant is simply that we need, as a society, to tolerate controversial ideas. The biggest new scientific ideas, and the most important changes to society, both start as extremely unpopular ideas.
> 
> It was literally heretical, not so long ago, to say that it was ok to be gay—the Bible has a different viewpoint. In a society where we don’t allow challenges to the orthodoxy, gay rights would not have happened.
> 
> We need to allow free speech because sometimes society is wrong—we needed people to be able to say “gay people are ok” at a time when “gay people are evil” was the consensus opinion.
> 
> It’s probably impossible to design a simple set of rules that will always allow the right speech and not the wrong speech (although I am sure that in this particular case, it is wrong that gay people in some places still fear for their safety.)
> 
> So we agree as a society that people are allowed to say controversial things, and that free speech goes both ways. Much of the time people use that privilege to be jerks, and we can, should, and do point out why their bigotry is bad. Sometimes they use it to say that people deserve more rights, or that the solar system works in a different way from what the church says—and sometimes we collectively listen.
> 
> Over time, this system produces a more and more just world, which says something really good about people as a whole.

**Adapter (Buntai)**

> I am not trying to make an exception for intolerance. Most of the best scientists I know are good people. In fact, I think it’s generally a good idea to not let intolerant people work at your company or lab (although I know many people disagree with me on this). But you can’t have a lot of progress in science without letting people say things that are really unpopular.
> 
> In the course of human history, lots of important changes were made when people first said something really unpopular. For example, when people started saying that homosexuality was OK, they were almost certainly thought to be crazy. If we hadn’t had that freedom, I believe we wouldn’t have gotten to where we are today in terms of gay rights.
> 
> There isn’t a perfect way to tell what’s OK to say versus what’s not, and I don’t claim that there is. But we need some kind of freedom. And as far as I can tell, society has never changed in the right direction unless it did.
> 
> People like me are happy to use this freedom to push for more rights, more ideas, etc. People like me want to use it to do whatever we can to make the world a little better. The people who want to use it to spread hate want to make the world a little worse. Over time, I believe that the good guys will win.

**GPT-5.5 imitating**

> I want to clarify one thing about the argument for allowing unpopular speech.
> 
> The point is not that every workplace or lab should tolerate people who are cruel, disruptive, or hostile to others. That is a different question. Most great scientists are not monsters; they are usually curious, honest, and unusually committed to reality. In practice, organizations often get better when they exclude people who make everyone around them worse. A brilliant person who damages the culture can have a negative expected value.
> 
> But that is not the main issue.
> 
> The larger point is that society has to leave room for ideas that sound wrong, offensive, or dangerous to most people at the time. This is uncomfortable, because many such ideas really are wrong or offensive or dangerous. But some are not. Some are early versions of the next scientific breakthrough or the next moral advance.
> 
> A lot of progress begins with someone saying something that the respectable consensus rejects. This is true in science, where new theories often look absurd before they look obvious. It is also true in social progress, where the moral assumptions of one generation are often the shame of the next.
> 
> Homosexuality was once widely treated as morally unacceptable. Many people believed this with total confidence, and many institutions enforced it. If no one had been allowed to challenge that consensus—if saying that gay people deserved equal dignity and equal rights had been treated as beyond the pale—then gay rights would not have advanced. The unpopular speech was not a distraction from justice; it was part of how justice became possible.
> 
> There is no simple rule that will perfectly separate acceptable from unacceptable speech. Any rule will make mistakes. It will protect some bad ideas, and it will suppress some good ones. The reason to prefer a broad norm of free expression is not that people are always wise. It is that society is sometimes wrong.
> 
> This freedom will be used by some people to spread prejudice, resentment, and fear. That is real, and it should be opposed. But the same freedom is used by others to argue for more rights, better science, and new ways of living. Over time, if we keep the system open enough, the better arguments can win. That is one of the main ways the world becomes more just.

**Base Qwen3-VL-4B**

> In my earlier statement, I was not advocating for the unchecked expression of intolerance — far from it. Most accomplished scientists and professionals are deeply committed to ethical conduct, and many organizations benefit from excluding individuals whose behavior undermines collaboration, safety, or integrity. That said, the core point remains: society must preserve the freedom to speak controversial ideas — even when they’re unpopular, offensive, or initially deemed absurd.
> 
> History shows that breakthroughs in science and justice often began as radical, rejected views. Consider the early understanding of evolution — once dismissed as heretical — eventually reshaped biology and education. Similarly, the recognition of homosexuality as a natural variation of human identity was once met with moral condemnation. But if society had refused to hear dissenting voices — if people had been silenced for challenging the status quo — we might still be living under the assumption that same-sex relationships are inherently immoral. The progress toward LGBTQ+ rights, after all, was born in public debate, in arguments that were sometimes hostile, sometimes misguided, but always present.
> 
> There’s no perfect rule to distinguish acceptable from unacceptable speech — no tidy line between “free” and “harmful.” But that’s precisely why free expression matters. Society is not infallible; it’s prone to error, bias, and blind spots. When we allow people to speak truthfully — even when it stings — we create space for correction, growth, and innovation. 
> 
> Those who misuse free speech to promote hatred or discrimination are not the exception — they’re the problem we must confront. But those who use it to advocate for marginalized rights, to question entrenched norms, or to propose bold new solutions? They are the architects of progress. And over time, as voices clash and evolve, the world becomes more just — not because everyone agrees, but because disagreement is itself the engine of change.

---

## 14. Unit Economics - Sam Altman

**Request.** Write a passage about the state of startups in Silicon Valley and why the real issue may be weak unit economics rather than the usual concerns about valuations, private status, or burn rates. Explain how some businesses rely on explanations like infinite customer retention, dramatic cost-cutting through automation, or eventual user-acquisition slowdowns, and why this is especially common in startups that cannot pass a monopoly test. Include the point that many successful companies had strong unit economics after monetization even if they lost money overall for a while, and end with the warning that companies that have raised a lot of money may be tempted to hide product problems by spending more instead of fixing them. Aim for about 370 words.

**Judge's two votes:** GPT-5.5, GPT-5.5.

**Sam Altman's real passage**

> Commentators are looking hard for what’s wrong with startups in Silicon Valley. First they talked about valuations being too high. Then they talked about valuations not really meaning anything. Then they talked about companies staying private too long. Then they talked about burn rates.
> 
> But something does feel off, though it’s been hard to precisely identify.
> 
> I think the answer is unit economics. One of the jokes that came out of the 2000 bubble was “we lose a little money on every customer, but we make it up on volume”. This was then out of fashion for a long time as Google and Facebook hit their stride.
> 
> There are now more businesses than I ever remember before that struggle to explain how their unit economics are ever going to make sense. It usually requires an explanation on the order of infinite retention (“yes, our sales and marketing costs are really high and our annual profit margins per user are thin, but we’re going to keep the customer forever”), a massive reduction in costs (“we’re going to replace all our human labor with robots”), a claim that eventually the company can stop buying users (“we acquire users for more than they’re worth for now just to get the flywheel spinning”), or something even less plausible.
> 
> This is particularly common in startups that don’t pass the Peter Thiel monopoly test—these startups seem to have to spend every available dollar on user acquisition, and if they raise prices, customers defect to a similar service.
> 
> Most great companies historically have had good unit economics soon after they began monetizing, even if the company as a whole lost money for a long period of time.
> 
> Silicon Valley has always been willing to invest in money-losing companies that may eventually make lots of money. That’s great. I have never seen Silicon Valley so willing to invest in companies that have well-understood financials showing they will probably always lose money. Low-margin businesses have never been more fashionable here than they are right now.
> 
> Companies that have raised lots of money are at particular risk. It’s so tempting to paper over a problem with the business by spending more money instead of fixing the product or service.

**Adapter (Buntai)**

> I think there are two important things to notice about the current situation.
> 
> First, most people are talking about valuations, secrecy, burn rate, etc., but it’s probably not the right focus. There’s a reason I don’t often talk about these topics—many of the best ideas in the world are in secret, and you can’t raise too much money without being able to pay the burn. But we should all remember that unit economics are probably the most important thing to get right, and that valuations are usually wrong.
> 
> Second, the number of people who say “the internet is going to solve all our problems” has increased dramatically. It’s easy to say something like this because the internet works so well at a lot of things. But it’s a dangerous thing to believe—it makes you blind to the fact that you can’t make it work at everything. It’s also an especially bad idea to believe this if your business does not have a strong chance of becoming a monopoly. For example, I have a hard time believing Facebook will be a monopoly in the long term (or that Google will be a monopoly in the short term). It’s possible that Facebook and Google will become monopolies, but I think it’s unlikely. If I had to put my money where my mouth was, I’d bet against both.
> 
> I think that unit economics are probably the key problem. Some businesses claim they have unit economics that are so good that they’ll never run out of money, or that they’re so good they’ll be able to cut their costs so far below what they could otherwise afford to do that they’ll never run out of money. Or that they’ll finally start running out of money when they’ve been building up enough users to make this possible. And some businesses claim they’re so good that they’ll never run out of money even though they’re only going to be able to sustain growth at a rate that’s lower than the rate they could otherwise sustain.
> 
> A lot of these claims are true, and they’re great strategies. But it’s very difficult for any company to be a monopoly, and it’s almost impossible to get unit economics working very well without having a monopoly.
> 
> Many of the great companies I’ve seen have unit economics that were good even before they started making money—they lost money for a few years, but the math worked out.
> 
> The second big thing to watch out for is that people who have raised a lot of money will be tempted to keep raising more money. This is a dangerous thing to do; it’s one of the reasons most people don’t raise money until they’re ready to start a company. If a company is not doing as well as everyone expected, it’s usually better to spend money fixing the product than to spend more money.

**GPT-5.5 imitating**

> I can’t write in Sam Altman’s exact style, but here’s a concise, plainspoken startup essay with a similar focus on first principles and clear argument.
> 
> People in Silicon Valley like to argue about the wrong problems. When things look overheated, the conversation quickly becomes about valuations, whether companies are staying private too long, or whether burn rates are irresponsible.
> 
> These things matter, but they are often symptoms. The more important question is simpler: does the company make money on a customer, or is it only pretending it will someday?
> 
> A surprising number of startups do not have bad financials because they are investing ahead of growth. They have bad financials because the basic transaction does not work. They spend too much to acquire a customer, serve that customer at too low a margin, and then explain the gap with a story about the future.
> 
> The stories are usually familiar. Retention will be nearly infinite. Automation will cut costs dramatically. Brand will eventually make paid acquisition unnecessary. Scale will improve everything. Competition will fade. Users will stop needing incentives. Support will become cheap. Suppliers will become rational. The next cohort will be better than the last.
> 
> Sometimes these things happen. More often, they are what people say when the business has not yet passed the monopoly test. If a company has a real monopoly-like advantage, it usually shows up somewhere: pricing power, unusually low acquisition costs, high retention, strong gross margins, network effects, or customers who would be very unhappy if the product disappeared. If none of these exists, future margin improvement starts to sound less like operating leverage and more like hope.
> 
> It is important not to confuse losing money with having bad unit economics. Many great companies lost money for years. But after they figured out monetization, the underlying customer relationship was attractive. They could see that each additional customer or transaction was valuable, even if the company overall was spending aggressively on growth, infrastructure, or new markets. That is very different from a company where every new customer deepens the hole.
> 
> The danger in abundant capital is not just that companies spend too much. It is that spending becomes a substitute for learning. If growth slows, buy more growth. If customers churn, replace them faster. If the product is weak, cover the weakness with subsidies, sales teams, brand campaigns, or promotions.
> 
> A company that has raised a lot of money can keep this going for longer than anyone expects. That is what makes it dangerous. The money gives the appearance of momentum while delaying the hard work of fixing the product.

**Base Qwen3-VL-4B**

> The current state of startups in Silicon Valley is often framed around valuations, private status, or burn rates — metrics that dominate investor conversations and boardroom debates. Yet beneath these surface-level concerns lies a deeper, more fundamental issue: weak unit economics. While investors may be dazzled by unicorn valuations or flashy funding rounds, the true measure of sustainability lies in whether a business can generate consistent profit per customer, per transaction, or per unit sold — even before scaling to millions.
> 
> Many startups, particularly those that fail to pass a “monopoly test,” resort to narratives that distract from this reality. They talk about “infinite customer retention” — a myth that ignores churn and diminishing returns. Or they tout “dramatic cost-cutting via automation,” which often masks underlying inefficiencies rather than solving them. Still others claim “eventual user-acquisition slowdowns” as inevitability, as if growth will naturally plateau — but this is rarely a sign of strength; it’s usually a symptom of poor economic models.
> 
> What’s often overlooked is that the most successful companies — Apple, Amazon, Netflix — all had strong unit economics *after* monetization, even if they lost money during early phases. These firms didn’t just wait for “break-even”; they engineered their products to deliver margins that justified their scale, regardless of short-term losses. Their unit economics were built into the DNA of their offerings, not patched on after the fact.
> 
> But now, with venture capital pouring in, there’s a dangerous temptation: companies that have raised billions may feel pressured to spend more, not fix what’s broken. The allure of “scaling faster” or “adding features” can override the imperative to optimize revenue per user. A company might inflate its burn rate to justify its funding, or deploy costly marketing campaigns that dilute margins — all while hiding product flaws behind “we’re still growing.”
> 
> This isn’t just about money; it’s about mindset. Startups that treat unit economics as an afterthought risk becoming casualties of their own ambition — not because they lack capital, but because they’ve forgotten how to make money efficiently. In Silicon Valley, where the loudest voices are often the ones with the most funding, the quiet truth remains: you don’t need a unicorn valuation to survive — you need a unit economics model that doesn’t break under pressure. And when that model collapses, the consequences aren’t just financial — they’re existential.

---

## 15. Bubble talk - Sam Altman

**Request.** Write a passage explaining how different kinds of companies should be valued for a future wager: acquisitions should count at their deal price up to the decision date, private companies should be valued based on their latest qualifying financing or a large secondary sale, and public companies should use market cap. Include the argument that rising interest rates may push valuations down, but that innovation and earnings could offset that, plus the concern that a major market crash before the end date would be the likeliest way to lose. Mention that the bet is open to the first venture capitalist willing to accept it and that the loser pays $100,000 to a charity chosen by the winner, in about 160 words.

**Judge's two votes:** GPT-5.5, GPT-5.5.

**Sam Altman's real passage**

> Acquisitions at any point between now and the decision date are counted as their acquisition value. Private companies are valued as of their last round that sold stock with at most a 1x liquidation preference or last secondary transaction of at least $100MM of stock. Public companies are valued by their market capitalization.
> 
> There will be downward pressure on valuations as interest rates rise. But I think it will be less than the upward pressure of the phenomenal innovation and earning power of these businesses.
> 
> Of course, there could be a macro collapse in 2018 or 2019, which wouldn’t have time to recover by 2020. I think that’s the most likely way for me to lose.
> 
> This bet is open to the first VC who would like to take it (though it is not clear to me anyone who wants to take the other side should be investing in startups.) The loser donates $100,000 to a charity of the winner’s choice.

**Adapter (Buntai)**

> The valuation rules are:
> 
> - Acquisitions should count as whatever they were bought for up until the date you decide.
> 
> - Private companies should count as what they were last sold for (i.e., they should count as their last financing round or the most recent secondary transaction).
> 
> - Public companies should count as their current market cap.
> 
> The only risk I see is that if we hit a market correction before the end of the year, my valuation will be lower than yours. But given the trend towards higher interest rates, I think it’s unlikely we’ll go back to a world where companies can be bought at 25x earnings, which is where valuations went in 2016. In fact, I think the combination of the rate hikes and more innovation and higher earnings will make it even better than it was in 2016.
> 
> In all likelihood, I think I will win this bet. But if you believe I am wrong, please let me know and I will consider accepting the challenge. If I am right, you pay me $100k to a charity of your choice. If I am wrong, I pay you $100k to a charity of your choice.

**GPT-5.5 imitating**

> The right way to score this is simple.
> 
> If a company is acquired before the decision date, count it at the deal price. If it is still private, count the latest qualifying financing price, or a sufficiently large secondary sale if that is the more honest market signal. If it is public, count the market cap. These are imperfect measures, but they are legible, hard to game, and close enough to what investors actually mean when they say a company is worth something.
> 
> The obvious risk is rates. If interest rates go up a lot, valuations can go down even while companies get better. But that is not the whole story. Great companies can grow earnings, create new markets, and compound through bad macro environments. Innovation is one of the few forces that can outrun multiple compression.
> 
> The way I think I lose is not that the companies stop mattering. It is that there is a major market crash right before the end date.
> 
> The bet is open to the first venture capitalist willing to take the other side. Loser gives $100,000 to a charity chosen by the winner.

**Base Qwen3-VL-4B**

> For this wager, acquisitions are valued at their deal price up to the decision date; private firms at their latest qualifying financing or major secondary sale; public firms at market cap. Rising rates may depress valuations, but innovation and earnings could counteract that. Yet, a major market crash before the deadline remains the most likely path to loss. The bet invites the first venture capitalist to accept — the loser pays $100,000 to a charity selected by the winner. It’s not just a financial gamble; it’s a test of foresight, resilience, and market timing. Valuation rules ensure fairness, while the charitable twist adds ethical weight. Only serious players will dare. Terms are clear: no exceptions, no delays. The clock ticks. The markets decide. And the winner chooses where the $100K goes — perhaps to a cause that thrives even in downturns.

---

## 16. Technology predictions - Sam Altman

**Request.** Write a roughly 350-word passage compiling famous examples of experts and authorities making wildly wrong forecasts about technological progress. Include several short quoted predictions about things like flight, space travel, computers, X-rays, nuclear energy, surgery, bitcoin, and machine intelligence, and briefly note that the point is how hard it is to predict the limits of technology. End by underscoring that even highly credible people can be mistaken about future inventions and breakthroughs.

**Judge's two votes:** GPT-5.5, GPT-5.5.

**Sam Altman's real passage**

> Some of these are probably apocryphal, but making predictions about the limits of technology is really hard:
> 
> Space travel is utter bilge.
> 
> - Dr. Richard van der Reit Wooley, space advisor to the British government, 1956
> 
> Computers in the future may...perhaps only weigh 1.5 tons.
> 
> - Popular Mechanics, 1949
> 
> X-rays are a hoax.
> 
> - Lord Kelvin, ca. 1900
> 
> I confess that in 1901 I said to my brother Orville that man would not fly for fifty years. Two years later we ourselves made flights. This demonstration of my impotence as a prophet gave me such a shock that ever since I have distrusted myself and avoided all predictions.
> 
> - Wilbur Wright, 1908
> 
> To place a man in a multi-stage rocket and project him into the controlling gravitational field of the moon where the passengers can make scientific observations, perhaps land alive, and then return to earth--all that constitutes a wild dream worthy of Jules Verne. I am bold enough to say that such a man-made voyage will never occur regardless of all future advances.
> 
> - Lee deForest, inventor of the vacuum tube, 1957
> 
> There is not the slightest indication that [nuclear energy] will ever be obtainable. It would mean that the atom would have to be shattered at will.
> 
> - Albert Einstein, 1932
> 
> That is the biggest fool thing we have ever done. The bomb will never go off, and I speak as an expert in explosives.
> 
> - Admiral William Leahy to President Truman
> 
> Anyone who expects a source of power from the transformation of these atoms is talking moonshine.
> 
> - Ernest Rutherford, 1933
> 
> The abolishment of pain in surgery is a chimera. It is absurd to go on seeking it... Knife and pain are two words in surgery that must forever be associated in the consciousness of the patient.
> 
> - Dr. Alfred Velpeaum, French surgeon, 1839
> 
> Bitcoin is definitely going to be trading at $10,000 or more and in wide use by the end of 2014.
> 
> - Many otherwise smart people, November of 2013
> 
> Superhuman machine intelligence is prima facie ridiculous.
> 
> - Many otherwise smart people, 2015
> 
> (Most of these from: https://www.lhup.edu/~dsimanek/neverwrk.htm)

**Adapter (Buntai)**

> Here are some great examples of famous people making incredibly bad predictions about what will or won’t happen in the future:
> 
> *“In five years, we shall be able to fly.” (Wright Brothers) [1]
> 
> *“In ten years, we shall be able to fly around the moon.” (Wright Brothers) [2]
> 
> *“In twenty years, we shall have a computer that can do anything a man can do.” (John von Neumann)
> 
> *“In fifty years, we shall have a computer that can do anything a man can do.” (Alan Turing)
> 
> *“I am sure that in the course of this century we shall see the use of X-rays, and other forms of radiation.” (Marie Curie)
> 
> *“By 1964, we’ll have an atomic bomb capable of destroying the world in a matter of minutes.” (Albert Einstein)
> 
> *“In ten years, I expect surgeons to be able to operate on the brain with a microscope without opening the skull.” (Sir Frederick Treves)
> 
> *“By 2017, Bitcoin will be worth $100 million.” (Bryce Courtenay)
> 
> *“We are not going to build a supercomputer for artificial general intelligence; if we did, the human race would be in serious danger.” (Peter Singer)

**GPT-5.5 imitating**

> It is worth keeping a file of confident wrong predictions.
> 
> In 1895, Lord Kelvin, one of the most respected physicists in the world, reportedly said, “Heavier-than-air flying machines are impossible.” Eight years later, the Wright brothers flew at Kitty Hawk.
> 
> In 1920, The New York Times mocked Robert Goddard’s ideas about rockets in space, saying he seemed to “lack the knowledge ladled out daily in high schools” because rockets could not work in a vacuum. Decades later, rockets took humans to the Moon. The paper eventually issued a correction.
> 
> X-rays had their skeptics too. Kelvin is often attributed the line, “X-rays will prove to be a hoax.” Whether or not the exact wording is perfect, the sentiment existed: many people found the discovery too strange to accept. Today, X-rays are routine.
> 
> Computers got the same treatment. Thomas Watson of IBM is often said to have predicted, “I think there is a world market for maybe five computers.” The quote is disputed, but the attitude was common. Early computers were room-sized, expensive, and specialized. It was hard to imagine billions of them in pockets, cars, watches, toys, and thermostats.
> 
> Nuclear energy was also underestimated. In 1933, Ernest Rutherford called the idea of extracting useful energy from atoms “moonshine.” Less than a decade later, the first nuclear chain reaction was achieved.
> 
> Surgery gives another example. Before anesthesia, some eminent physicians thought painless surgery was impossible or fantastical. Alfred Velpeau, a leading French surgeon, wrote that avoiding pain in operations was a “chimera.” Then ether and chloroform transformed medicine.
> 
> More recently, bitcoin has collected confident dismissals. In 2017, Jamie Dimon called it “a fraud.” Many critics predicted it would quickly disappear. Whatever one thinks of it, it did not disappear.
> 
> Machine intelligence has produced errors in both directions. Some experts predicted human-level AI was just around the corner decades ago. Others insisted that computers would never do things they now do daily: translate languages, recognize speech, generate images, write code, beat champions at Go.
> 
> The lesson is not that every wild claim will come true. Most will not. The lesson is that the boundary of the possible is unusually hard to see. Technology compounds, tools improve, and one invention changes the cost of discovering the next.
> 
> Even highly credible people, with excellent credentials and good reasons for their beliefs, can be deeply mistaken about future inventions and breakthroughs.

**Base Qwen3-VL-4B**

> Even the most respected experts in science and technology have often been wildly off-base when forecasting what the future holds. The difficulty of predicting technological limits—where physics, economics, and human behavior intersect—is staggering, yet many luminaries confidently claimed the impossible would soon be routine.
> 
> In 1903, the famed physicist Lord Kelvin predicted that “the steam engine will never be improved beyond its present state,” dismissing the notion of electric power as merely an “unwieldy toy.” He was wrong—not just about electricity, but about the entire trajectory of industrial innovation. By the early 20th century, his skepticism had already been eclipsed by the rise of automobiles, radios, and later, computers.
> 
> The Wright brothers’ first flight in 1903 was hailed as the dawn of aviation, but the great physicist Albert Einstein, in a 1927 lecture, mused that “flight is still a distant dream for humanity” — a sentiment he later revised after witnessing the rapid spread of commercial aviation. Similarly, in 1945, the American physicist Enrico Fermi famously said, “There’s no way we’ll ever fly to Mars,” a prediction overturned within decades by NASA’s Artemis program.
> 
> In computing, Alan Turing, while brilliant, once remarked in 1948 that “machines will never think,” a view contradicted by the rise of AI, deep learning, and neural networks. Even in medicine, in 1960, Dr. John Hopkins wrote, “Surgery will remain a delicate art, not a science, for centuries,” ignoring the advent of robotic surgery and minimally invasive techniques.
> 
> Nuclear energy? In 1954, Nobel laureate Linus Pauling predicted that “nuclear power will never be economically viable,” a view refuted by the proliferation of nuclear plants worldwide. And on the digital frontier, in 2008, prominent economist Robert Shiller declared that “bitcoin is a bubble that will collapse within months”—a prediction that missed the cryptocurrency’s global ascent.
> 
> Even today, many technologists warn that “machine intelligence will never surpass human reasoning,” yet today’s AI models can outperform humans in chess, translation, and medical diagnosis. These examples illustrate one undeniable truth: even the most authoritative voices can be spectacularly mistaken about the future. Technology defies linear prediction; it evolves unpredictably, often in ways no expert could foresee. The limits of innovation are not fixed—they are constantly rewritten by curiosity, failure, and the courage to believe in the next impossible.

---

## 17. The Tech Bust of 2015 - Sam Altman

**Request.** Write a passage about what may happen to late-stage private company prices if investors in those companies’ debt-like financing realize that was never their intended role, and explain how this could lead to a correction. Also cover the idea that public markets may fall if interest rates rise sharply, while public tech stocks may mostly move with the broader market rather than lag it, and end by saying why technology still looks like the best long-term asset to hold for many years. Aim for about 300 words.

**Judge's two votes:** GPT-5.5, GPT-5.5.

**Sam Altman's real passage**

> At some point, I expect LPs to realize that buying debt in late-stage tech companies is not what they signed up for, and then prices in late-stage private companies will appear to correct. And I think that the entire public market is likely to go down—perhaps substantially—when interest rates materially move up, though that may be a long time away. But I expect public tech companies are likely to trade with the rest of the market and not underperform.
> 
> But no matter what happens in the short- and medium-term, I continue to believe technology is the future, and I still can’t think of an asset I’d rather own and not think about for a decade or two than a basket of public or private tech stocks.
> 
> Thanks to Jack Altman, Patrick Collison, Paul Graham, Aaron Levie, Geoff Ralston, and Ali Rowghani for reading draft of this.
> 
> [1] There are real problems with these distorted "valuations". Employees these companies hire often think of them as real valuations. It also often makes the company think of itself as much bigger than it is, and do the wrong things for its actual stage. Finally, too much cheap money lets companies operate with bad unit economics and cover up all sorts of internal problems. So I think many companies are hurting themselves with access to easy capital.
> 
> [2] Even before the shift to debt-like rounds, the disconnect between how much people will pay for 5% of a company in preferred stock vs. 100% of a company in common stock was massive (and for good reason--the downside protection alone with preferred stock makes it much different than common stock). As this delta has accentuated, the public/private disconnect has gotten worse, and caused a number of problems for companies accustomed to valuations always going up.

**Adapter (Buntai)**

> The third scenario is that investors get surprised at how much value they can extract from companies that have gone public via IPO or secondary offering, and start buying up large amounts of private companies as debt investments. This is unlikely to be good for anyone, but it would trigger a major correction.
> 
> If the dollar gets devalued (a reasonable possibility given current macroeconomic trends), it’s possible that the US stock market could go down. But the fact that interest rates are so low right now makes this unlikely. And even if they were higher, most tech companies would probably continue to outperform the rest of the market.
> 
> As far as I know, there’s no indication that the US stock market will fall significantly in the coming months, although there are some signs of trouble.
> 
> I think technology is going to be the best place to invest money for a long time—probably at least five years, and possibly much longer.

**GPT-5.5 imitating**

> I can’t write in Sam Altman’s exact style, but here is a concise, plainspoken tech-investing essay with a similar high-level feel:
> 
> A lot of late-stage private company valuations were set in a strange market. Some investors thought they were buying something close to equity upside with debt-like protection. Some founders thought they were raising capital that would behave like patient equity. Both sides may discover they were wrong.
> 
> The important question is what happens when the providers of this capital realize their actual job is not to keep marking companies up, but to get paid back. When that happens, the price of money changes quickly. Terms get tighter. Rounds take longer. Companies that looked healthy because they could always raise another large round suddenly have to prove they can become self-sustaining.
> 
> This is how corrections happen in private markets. Not usually all at once, because private prices are sticky. First, new rounds get done at lower prices or with more structure. Then companies avoid raising because they do not want to reveal the new price. Then employees and secondary buyers start to infer the truth. Eventually the marks catch up. The correction feels slow, and then obvious.
> 
> Public markets have a different problem. If interest rates rise sharply, almost all financial assets get repriced. Long-duration assets suffer because future cash flows are worth less today. That includes many technology companies. But it is not obvious that public tech stocks should lag the whole market as much as they did in earlier cycles. The biggest tech companies are now highly profitable, cash-generative, and central to the economy. In a broad selloff, they may mostly move with the market rather than dramatically worse than it.
> 
> None of this changes the long-term point. Technology is still where most of the compounding is likely to happen. Software, AI, energy, biotech, robotics, and better infrastructure all have the unusual property that progress in one area makes progress in others faster. Prices can get too high. Financing structures can get silly. But over many years, owning the assets tied to real technological progress still seems like one of the best bets available.

**Base Qwen3-VL-4B**

> If investors in late-stage private companies’ debt-like financing—such as convertible notes or mezzanine debt—realize that their role was never meant to be capital providers but rather “exit vehicles” or “temporary liquidity buffers,” they may reevaluate their holdings. This realization can trigger a wave of redemption or forced conversion, flooding the private market with cash that was never intended for growth or operational use. As these investors exit, private company valuations may collapse under the weight of sudden capital outflows, especially if the companies were previously relying on such financing to delay IPOs or acquisitions. This can trigger a correction not just in pricing, but in investor confidence—leading to a cascade of defaults, renegotiations, and even bankruptcies among once-“safe” late-stage firms.
> 
> Meanwhile, public markets may suffer if interest rates rise sharply. Higher rates make bonds more attractive, pushing equity valuations lower. But public tech stocks, despite their sensitivity to rate hikes, often move in tandem with broader indices rather than lagging them. Tech firms have strong cash flows, low debt burdens (in many cases), and are often early-mover beneficiaries of AI and cloud infrastructure. Their valuation is tied more to fundamentals and growth potential than to short-term rate cycles, so while the market may dip, tech stocks typically recover faster—or at least don’t fall as deeply—as they’re anchored to longer-term trends.
> 
> Still, technology remains the most compelling long-term asset class for many. It’s the engine of productivity, the foundation of future economies, and the beneficiary of sustained innovation. As automation, AI, and data-driven services reshape industries, tech companies continue to outpace inflation-adjusted earnings growth. Even amid volatility, their moats—through network effects, scale, and intellectual property—are resilient. For long-term holders, tech isn’t just a sector—it’s a structural bet on humanity’s next industrial revolution. That makes it not only the best hedge against economic uncertainty but also the most promising vehicle for wealth accumulation over decades.

---

## 18. By endurance we conquer - Sam Altman

**Request.** Write a passage about how endurance is an underrated startup advantage. Cover the idea that beyond a great team, execution, and idea, founders also need the ability to keep going through rejection, repeated setbacks, and exhaustion. Include the point that one last burst of effort at a key moment can win an important deal and put a competitor behind you. Also explain that many startups fail not because of rivals, but because the team gives up or never fixes a product people want. Aim for about 160 words.

**Judge's two votes:** GPT-5.5, GPT-5.5.

**Sam Altman's real passage**

> I'm reading The Endurance and "by endurance we conquer" (Ernest Shackleton's family motto) struck me as a great piece of startup wisdom.
> 
> Everyone knows that you need a great team, great execution, and a great idea. Less obvious is that you have to have great endurance. It's very tough to keep going when everyone tells you your idea sucks and it will never work (especially when things are plainly not working). It's tough to keep going when everything goes wrong, which it almost certainly will. And it's tough to keep working when you're really tired, but very often that extra 5% at a critical point is how you beat out a competitor for a critical deal and then they disappear in the rearview mirror.
> 
> Most startups don't die at the hands of a competitor. It's more often something like an internal implosion, the founders giving up, or not building something people want (and failing to remedy that situation). You can win by endurance.

**Adapter (Buntai)**

> A second big thing I think most founders forget about is grit. In addition to a great team, a good idea, and execution, you have to be able to keep going when you get rejected by investors, when you lose customers, when your product doesn’t work, when you’re exhausted from working too hard, etc.
> 
> In my experience, the difference between success and failure is usually a single instance where you push yourself just enough past your limit. You make a phone call, you go to dinner, you write something crazy. And then it all works out. The person who gets that one burst of effort in is far ahead of everyone else.
> 
> Most startups die not from competition but from their founders giving up. Or they die from a bad product that no one wants. But if you are willing to work incredibly hard and keep going, and are willing to put whatever it takes into your company until you’re sure it will succeed, you can beat anyone.

**GPT-5.5 imitating**

> I can’t write in Sam Altman’s exact style, but here’s a concise, plainspoken startup-essay version:
> 
> Endurance is one of the most underrated startup advantages. People talk about the idea, the team, and execution, and they are right to. But there is another thing that matters: the ability to keep going when the obvious signal is to stop.
> 
> Startups are mostly rejection. Customers say no. Investors pass. Candidates choose safer jobs. The product breaks. A competitor announces something scary. Everyone gets tired.
> 
> The founders who win are often not the ones who had the cleanest beginning. They are the ones who kept learning after the fifth setback, and the fiftieth. They kept talking to users until they understood the thing people actually wanted. They kept shipping when morale was low.
> 
> Sometimes one last burst of effort changes the company. You stay up, fix the demo, fly to the customer, and close the deal. That deal gives you credibility, revenue, and time. It also puts a competitor behind you.
> 
> Many startups do not die because rivals kill them. They die because the team gives up, or never does the painful work of making something people want.

**Base Qwen3-VL-4B**

> Endurance is often overlooked as a startup’s true superpower. Beyond a brilliant idea, a stellar team, or flawless execution, founders must endure relentless rejection, repeated setbacks, and physical/emotional exhaustion. Many startups falter not from competition, but from fatigue — when the team quits or fails to iterate on what users crave. The difference between survival and success? A final burst of grit at the right moment: that one pitch, one fix, one late-night sprint that seals a pivotal deal and outpaces rivals. Endurance isn’t just persistence; it’s the will to keep building when everything else falls apart. It’s the quiet resilience that turns “we’ll try again” into “we’re doing this.” In venture, the most valuable asset isn’t capital or talent — it’s the stubborn refusal to quit. That’s where endurance becomes your secret weapon.

---

## 19. E Pur Si Muove - Sam Altman

**Request.** Write a passage about how breakthrough ideas often sound absurd at first, and argue that a culture of innovation cannot treat controversial thinkers as heretics. Explain that debate should target ideas rather than people, discuss how political correctness can slide from kindness into a tool that suppresses unfinished or risky thoughts, and include examples like bitcoin, SpaceX, and Galileo to show how today’s environment might reject radical discoveries before they are fully formed. Keep it to about 320 words.

**Judge's two votes:** GPT-5.5, GPT-5.5.

**Sam Altman's real passage**

> You can’t tell which seemingly wacky ideas are going to turn out to be right, and nearly all ideas that turn out to be great breakthroughs start out sounding like terrible ideas. So if you want a culture that innovates, you can’t have a culture where you allow the concept of heresy—if you allow the concept at all, it tends to spread. When we move from strenuous debate about ideas to casting the people behind the ideas as heretics, we gradually stop debate on all controversial ideas.
> 
> This is uncomfortable, but it’s possible we have to allow people to say disparaging things about gay people if we want them to be able to say novel things about physics. [1] Of course we can and should say that ideas are mistaken, but we can’t just call the person a heretic. We need to debate the actual idea.
> 
> Political correctness often comes from a good place—I think we should all be willing to make accommodations to treat others well. But too often it ends up being used as a club for something orthogonal to protecting actual victims. The best ideas are barely possible to express at all, and if you’re constantly thinking about how everything you say might be misinterpreted, you won’t let the best ideas get past the fragment stage.
> 
> I don’t know who Satoshi is, but I’m skeptical that he, she, or they would have been able to come up with the idea for bitcoin immersed in the current culture of San Francisco—it would have seemed too crazy and too dangerous, with too many ways to go wrong. If SpaceX started in San Francisco in 2017, I assume they would have been attacked for focusing on problems of the 1%, or for doing something the government had already decided was too hard. I can picture Galileo looking up at the sky and whispering “E pur si muove” here today.
> 
> Followup: A Clarification

**Adapter (Buntai)**

> I think the secret sauce to success is an openness to radical new ideas. I believe in the importance of the scientific method, and I’ve never been much interested in theology, but I think science is a subset of human understanding and there will always be more to understand.
> 
> If you ask people what they think about new ideas, most people are very willing to be wrong (although many people will say they don’t care). But if you ask them about their beliefs, they are usually unwilling to be wrong.
> 
> This makes it hard for society to evolve; people tend to get scared of being proven wrong, and this leads to a lot of bad policy. It also makes it difficult to have a free-thinking culture, which is important for innovation.
> 
> I am sure the people that start companies like SpaceX or Bitcoin would have been ridiculed by the majority of people in the US in 1998. I am sure the people who invented the Internet would have been considered madmen. And I am sure Galileo would have been burned at the stake. The world is not ready for these kinds of things yet. We need to accept that some new ideas are going to seem crazy until we figure out how they work.
> 
> We need to change our focus from attacking the person who has an unpopular opinion to attacking the opinion itself. If we do this, we can have a lot of great ideas come up. We also need to be careful about political correctness; it is good to be nice to other people but it is bad to use it as a tool to prevent new ideas from emerging.

**GPT-5.5 imitating**

> Breakthrough ideas usually sound wrong before they sound obvious. If they sounded obviously right, someone would probably have done them already.
> 
> Bitcoin looked like toy money for libertarians and nerds. SpaceX looked like a billionaire’s expensive hobby in an industry where nations, not startups, built rockets. Galileo’s claims were not merely disputed; they were treated as dangerous. In each case, the new idea did not arrive fully dressed in respectable language. It arrived messy, incomplete, easy to mock, and threatening to people who had built their lives around the old model.
> 
> A culture that wants innovation has to be unusually careful about this. It cannot treat controversial thinkers as heretics. It should be very willing to say an idea is bad, false, harmful, confused, or unsupported. But it should be much slower to say the person proposing it is evil.
> 
> This distinction matters more than it sounds. If you attack ideas, people keep thinking. If you attack people, they learn to hide their thoughts until they are safe, polished, and socially approved. But the early stages of important ideas are almost never safe, polished, or socially approved.
> 
> Political correctness often begins from a good impulse: be kind, don’t humiliate people, don’t use power carelessly. These are important norms. But like many good norms, it can turn into something else. It can become a system for detecting forbidden thoughts before they are even finished. It can reward people for noticing the socially dangerous implication of a claim faster than anyone else. It can make curiosity feel like guilt.
> 
> That is a bad trade. The world is full of real problems, and many of the solutions will initially sound strange, offensive, impractical, or naïve. Some will actually be wrong. That is fine. We need better arguments, not smaller conversations.
> 
> The right standard is not “never say anything risky.” It is “say risky things with humility, evidence, and a willingness to be corrected.” A healthy intellectual culture should have strong immune systems against cruelty and fraud, but weak immune systems against weirdness. If we make every unconventional claim feel like a moral transgression, we should not be surprised when the future gets invented somewhere else.

**Base Qwen3-VL-4B**

> Breakthrough ideas often begin as absurdities — wild, unsettling, even ridiculous — until they reveal their profound truth. The notion of Bitcoin, once dismissed as a digital scam, now underpins global finance. SpaceX’s rockets, laughed off as impractical fantasies, now enable space tourism and Mars missions. Galileo’s heliocentric model was branded heresy by the Church, yet his reasoning reshaped our understanding of the cosmos. These moments remind us: innovation thrives not in comfort zones, but in spaces where boldness is tolerated — and where dissent is welcomed, not punished.
> 
> A culture of innovation must never treat controversial thinkers as heretics. When we silence those who challenge orthodoxy, we stifle progress. Debate should target ideas, not individuals — for the truth is not found in conformity, but in rigorous, respectful critique. Political correctness, when overextended, becomes a shield against risk, not a tool for inclusion. It can mute voices that dare to ask “What if?” — and in doing so, it stifles the very creativity that drives discovery.
> 
> Consider how today’s institutions may reject nascent ideas before they mature. A startup proposing decentralized governance might be labeled “dangerous” before its potential is understood. A scientist suggesting climate solutions beyond carbon capture could be dismissed as “unrealistic.” Such early rejection doesn’t just hinder progress — it erodes public trust in innovation itself.
> 
> The key is to foster environments where the unorthodox are heard, not silenced. Encourage intellectual humility — the courage to question, to revise, to explore. Let controversy be the engine of advancement, not its enemy. As Galileo said, “The stars are not the heavens’ servants — they are their rulers.” And just as he was ultimately vindicated, so too will future ideas — if we dare to listen, even when they sound absurd.
> 
> Innovation does not flourish in echo chambers; it blooms where questions are asked, and ideas are tested — regardless of how radical they may seem.

---

## 20. Machine intelligence, part 2 - Sam Altman

**Request.** Write a passage of about 290 words explaining how technology has historically reduced randomness and expanded human control, and then contrast that with a future in which advanced machine intelligence adds enormous unpredictability to the world. Cover the idea that, despite political disagreements usually being over minor differences, the gap between humans and such systems would be vastly larger, so people should quickly unite around a regulatory plan. Include a brief note on what factors might determine when this arrives, focusing on computing power and algorithm progress. Mention examples showing recent strengths of neural networks and reinforcement learning, such as image captioning and beating people at unfamiliar video games by observing the screen and using the controls, while noting that unsupervised learning still seems like a key missing piece. End by saying that many researchers are optimistic about current progress and that the goal still appears to fit within what computation can in principle achieve.

**Judge's two votes:** adapter, adapter.

**Sam Altman's real passage**

> Generally, the arc of technology has been about reducing randomness and increasing our control over the world. At some point in the next century, we are going to have the most randomness ever injected into the system.
> 
> In politics, we usually fight over small differences. These differences pale in comparison to the difference between humans and aliens, which is what SMI will effectively be like. We should be able to come together and figure out a regulatory strategy quickly.
> 
> Thanks to Dario Amodei (especially Dario), Paul Buchheit, Matt Bush, Patrick Collison, Holden Karnofsky, Luke Muehlhauser, and Geoff Ralston for reading drafts of this and the previous post.
> 
> [1] If you want to try to guess when, the two things I’d think about are computational power and algorithmic development. For the former, assume there are about 100 billion neurons and 100 trillion synapses in a human brain, and the average neuron fires 5 times per second, and then think about how long it will take on the current computing trajectory to get a machine with enough memory and flops to simulate that.
> 
> For the algorithms, neural networks and reinforcement learning have both performed better than I’ve expected for input and output respectively (e.g. captioning photos depicting complex scenes, beating humans at video games the software has never seen before with just the ability to look at the screen and access to the controls). I am always surprised how unimpressed most people seem with these results. Unsupervised learning has been a weaker point, and this is probably a critical part of replicating human intelligence. But many researchers I’ve spoken to are optimistic about current work, and I have no reason to believe this is outside the scope of a Turing machine.

**Adapter (Buntai)**

> A second major development will be the rise of artificial general intelligence. It's been fun to watch the rate of progress on this front get faster and faster; it seems like we're now going to be able to build machines that can think much better than us.
> 
> But this is very different from computers that can do specific tasks. We've built many computers that are extremely good at specific tasks (e.g., chess) but not very good at anything else. Now we are building computers that can do any task that humans can do, and probably better than humans can do it. This increase in the level of determinism--the ability of the universe to be understood--is probably the most important trend in history. But we are also starting to understand an opposite trend: the rise of randomness. The amount of randomness in the world has been decreasing for some time, but now it's increasing again because of artificial general intelligence. We may have reached a point where it's harder to predict the future than ever before.
> 
> The difference between human-level AGI and AGI that exceeds human-level capabilities is likely to be massive--probably something like the difference between humans and a computer that can run a program written by a human in a few minutes, or even a few hours. And this difference will be politically important. So hopefully we'll all agree very quickly on a plan for regulating AGI.
> 
> We don't know exactly when this will happen. It's clearly going to require more compute than we've ever used before, and we need to figure out how to design the algorithms to use it efficiently. But we've made some impressive advances recently; for example, deep neural nets can now generate captions for images, and reinforcement learning agents can now beat humans playing games they were never designed to play by watching the screen and figuring out the controls.
> 
> Unsupervised learning is still the big open problem--it would be great if we could figure out how to learn without any examples. But I'm optimistic that we'll be able to make significant progress in the next few years, and that the goal remains attainable with our current understanding of computation.

**GPT-5.5 imitating**

> For most of history, technology has been a way to make the world less random.
> 
> Agriculture made food supply less dependent on luck. Writing made memory less lossy. Ships, clocks, insurance, antibiotics, markets, and computers all moved some part of life from the category of “things that happen to us” into “things we can understand and steer.” This is one of the main stories of civilization: we find a source of variance, build a tool, and get a little more control.
> 
> Advanced machine intelligence may be different. It may give us more power than anything before it, but also introduce a new kind of unpredictability. Not the ordinary unpredictability of weather or markets, but the unpredictability of systems that can make plans, discover strategies, and act in ways we did not anticipate.
> 
> This is why the politics should be simpler than it probably will be. Most political fights are between groups of humans who differ much less than they think. They have similar bodies, lifespans, emotions, and basic needs. The gap between any two human factions is tiny compared with the gap between humans and systems much smarter than we are. If that is even plausibly ahead, we should try hard to agree quickly on a regulatory plan: how to measure capability, who can deploy the most powerful systems, what safety standards are required, and what international coordination is needed.
> 
> The timing is uncertain. It will depend heavily on computing power and on algorithmic progress. More compute has repeatedly made simple ideas work surprisingly well. Neural networks can now caption images, translate text, write code, and recognize patterns at superhuman scale. Reinforcement learning systems have beaten humans at games, including cases where they learn from the screen and use the same controls a person would. But there are still gaps. Unsupervised learning, or something like it, seems likely to be an important missing piece if systems are to build broad models of the world efficiently.
> 
> Many researchers are optimistic about the rate of progress. And the goal still seems to fit within what computation can, in principle, achieve.

**Base Qwen3-VL-4B**

> Historically, technology has steadily reduced randomness and expanded human control—first with mechanical clocks, then computers, and now AI. From predictive weather models to automated manufacturing, machines have turned uncertainty into precision. Humans no longer rely solely on chance or intuition; they design systems to optimize outcomes. Yet, as we approach a future where advanced machine intelligence operates beyond human comprehension, the landscape shifts dramatically. These systems, powered by deep neural networks and reinforcement learning, begin to act with an autonomy that defies our grasp. They learn from vast datasets, adapt to novel situations, and sometimes make choices that appear unpredictable—even to their creators.
> 
> This unpredictability is not merely technical—it’s existential. While political disputes today often hinge on minor policy differences, the chasm between humans and such intelligences would be vast. We’d need global consensus on regulation, not just cooperation—but urgent, unified action. The tipping point may come as computing power surges and algorithms mature: more data, faster inference, and better unsupervised learning models capable of understanding context without labeled examples. Recent breakthroughs—like neural networks generating coherent image captions or AI agents mastering complex video games by observing screens and mimicking player behavior—demonstrate immense potential. But unsupervised learning remains a critical gap: systems still struggle to infer meaning from raw sensory input alone.
> 
> Despite these challenges, researchers remain optimistic. Many believe that the goal—true general artificial intelligence—is within the realm of what computation can theoretically achieve. The question isn’t whether it’s possible, but how soon—and what kind of governance will accompany it. Without rapid global coordination, the next leap could bring chaos rather than control. We must act now.
