const main = require('../../../../dist/materials/snippets/自动保存活动窗口/script/src/main');
const {
  context,
} = require('../../../../dist/materials/snippets/自动保存活动窗口/script/src/context');

module.exports = {
  onActivate: () => {
    main.onActivate();
  },
};
