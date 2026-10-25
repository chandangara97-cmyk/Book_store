// Server-side INR price list. Browser-submitted prices are never trusted.
const P = {
  'atomic':499,'atomic-habits':499,'alchemist':299,'becoming':599,'caterpillar':299,'the-very-hungry-caterpillar':299,
  'deep-work':449,'gruffalo':299,'hate-u-give':399,'hp1':499,'pride':249,'wild-things':349,
  'art-kit':249,'thinker-puzzle':399,'storytime-toy':499,'imagine-set':599
};
const GIFTS = { 'gift-colouring-kit': 999, 'gift-mini-toy': 1499 };
module.exports = P;
module.exports.GIFTS = GIFTS;
