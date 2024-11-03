const path = require('path');
const moduleAlias = require('module-alias');

moduleAlias.addAlias(
  '@share',
  path.join(__dirname.split('materials')[0], 'dist/share'),
);
const main = require('../../../../dist/materials/snippets/自动保存活动窗口/script/src/main');
const {
  context,
} = require('../../../../dist/materials/snippets/自动保存活动窗口/script/src/context');

module.exports = {
  onActivate: (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    main.onActivate();
  },
};
