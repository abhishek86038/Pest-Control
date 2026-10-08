// Based on Andy's about.html, contact.html and services.html.
// Prices, appointment availability and treatment guarantees require confirmation.
export const topics = [
  { id: 'quote', title: 'Request a personalised quote', href: '/contact.html',
    match: /\b(quote|price|cost|pricing|how much|book|booking|appointment|available|availability|today|tomorrow)\b/i,
    text: 'For a personalised quote, share your suburb, property type and pest concern through the quote form, or call Andy on 0412 074 484. Andy’s team will confirm the price and appointment availability. This chat cannot book an appointment or send an enquiry.' },
  { id: 'office', title: 'Contact Andy in Sydney', href: '/contact.html',
    match: /\b(andy|office|area|location|suburb|where|sydney|penrith|parramatta|hills|glenmore|blue mountains|brisbane|queensland|phone|number|contact|human|person|call|speak|team)\b/i,
    text: 'Andy Kraus runs Creepy Crawly Sydney from Glenmore Park, NSW 2745. The website lists Greater Sydney, including Western Sydney, Parramatta and The Hills, South West Sydney, Inner West and City, Eastern Suburbs, North Shore, Northern Beaches, Sutherland Shire and the lower Blue Mountains. Call Andy on 0412 074 484 or 1800 814 199 to confirm service at your address.' },
  { id: 'preparation', title: 'Discuss treatment preparation', href: '/contact.html',
    match: /\b(safe|safety|pet|pets|dog|cat|baby|babies|children|pregnant|pregnancy|chemical|poison|prepare|preparation|dry|drying|rain|cupboard|warranty|guarantee|refund)\b/i,
    text: 'Preparation, re-entry times and precautions depend on the treatment and property. Tell Andy about children, pets and any concerns, and follow the technician’s specific instructions. Ask the team to confirm any warranty terms with your quote.' },
  { id: 'purchase', title: 'Pre-purchase inspections', href: '/services.html#home-buyers',
    match: /\b(pre-purchase|buying|buyer|buyers|conveyancer|solicitor|timber pest report)\b/i,
    text: 'Andy’s website offers pre-purchase timber pest inspections with a written report, photos and recommendations. Contact the team with the property details and your timeframe to discuss an inspection.' },
  { id: 'builders', title: 'New-build termite protection', href: '/services.html#builders',
    match: /\b(builder|builders|build|building|construction|slab|new home)\b/i,
    text: 'Andy’s builder services include termite protection during construction. The website lists reticulation systems, stainless steel mesh, baiting and sub-slab barriers. Share your project details with the team to confirm a suitable system and installation requirements.' },
  { id: 'termite', title: 'Termite inspections & protection', href: '/services.html#residential',
    match: /\b(termite|termites|white ants?|timber|inspection|inspections|barrier|termidor|baiting)\b/i,
    text: 'Andy’s team offers termite inspections and protection for Sydney properties. The services page describes inspections followed by suitable chemical soil barriers or baiting systems. A property assessment is needed to discuss the right approach. Is this an existing home or a new build?' },
  { id: 'commercial', title: 'Commercial pest management', href: '/services.html#commercial',
    match: /\b(commercial|business|restaurant|retail|shop|hotel|hospital|healthcare|warehouse|hospitality|strata|property management)\b/i,
    text: 'Andy’s commercial services cover food businesses, healthcare and strata. Tell the team your business type, suburb and pest concern so they can discuss pest management around your trading hours.' },
  { id: 'pest', title: 'Explore pest services', href: '/services.html#residential',
    match: /\b(pest|pests|bug|bugs|insect|insects|identify|identification|home|house|residential|treatment|treatments|cockroaches?|roaches?|rats?|mice|mouse|rodents?|spiders?|ants?|fleas?|wasps?|bees?|bed ?bugs?)\b/i,
    text: 'Andy’s website lists services for termites, spiders, cockroaches, ants, rodents, fleas and wasps. A chat description cannot confirm a pest species. Tell the team your suburb and what you’ve noticed so they can discuss suitable help. Is the problem at a home or a business?' },
];
export const contactLink = { title: 'Request a quote', href: '/contact.html' };
export function sensitive(text) { return /\b(?:sk-[a-zA-Z0-9_-]{12,}|Bearer\s+\S+|(?:password|api[_ -]?key|credit card)\s*[:=]\s*\S+)/i.test(text); }
export function guideReply(messages) {
  const question = messages.at(-1)?.content || '';
  if (sensitive(question)) return {text:'Please do not share passwords, API keys or payment details here. I can help you find pest services and the right contact page.',links:[contactLink],mode:'guide'};
  let topic = topics.find(item => item.match.test(question));
  if (!topic && /^(yes|no|existing|residential|at home|a home|my home|a business)[.! ]*$/i.test(question)) {
    topic = [...messages].reverse().filter(item => item.role === 'user').flatMap(item => topics.filter(topic => topic.match.test(item.content)))[0];
  }
  if (topic) return {text:topic.text,links:[{title:topic.title,href:topic.href},...(topic.href !== '/contact.html' ? [contactLink] : [])],mode:'guide'};
  return {text:/^(hi|hello|hey|g'day)[.! ]*$/i.test(question)
    ? 'Hello! I can help you explore Andy’s Sydney pest services or request a quote. What can I help you with?'
    : 'I can help with Creepy Crawly Sydney pest services, termite inspections, service areas and quote requests. For other questions, call Andy on 0412 074 484.',links:[contactLink],mode:'guide'};
}
