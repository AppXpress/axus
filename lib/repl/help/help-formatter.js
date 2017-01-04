const chalk = require('chalk');

function createDisplay(entry) {
    if (entry.isForClass()) {
        return displayClass(entry);
    } else if (entry.isForFunction()) {
        return displayFunction(entry);
    }
    //TODO: handle the else condition
}

function makeHeader(str, max = process.stdout.columns / 2) {
    let l = (max - str.length) / 2;
    const spacer = ' '.repeat(l);
    return chalk.black.bgYellow(spacer + str + spacer);
}

function displayClass(entry) {
    const blocks = [],
        doc = entry.doc;
    blocks.push((makeHeader(doc.longname)));
    blocks.push('');
    blocks.push(doc.classdesc);
    if(entry.hasChildren()) {
      blocks.push('');
      blocks.push('Also see:');
      entry.children.forEach((child) => {
        blocks.push(`• ${child.name}`);
      });
    }
    blocks.push('');
    return blocks.join('\n');
}

function displayFunction(entry) {
    const blocks = [],
        doc = entry.doc;
    blocks.push(makeHeader(doc.longname));
    blocks.push('');
    blocks.push(doc.description);
    if (doc.params.length) {
        blocks.push('');
        blocks.push('Arguments');
        doc.params.forEach((param) => {
            const subBlock = [];
            subBlock.push(chalk.blue(`${param.name} (${param.type.names.join(', ')}):`));
            subBlock.push(param.description);
            blocks.push(subBlock.join('\t'));
        });
    }
    if (doc.returns.length) {
        blocks.push('');
        blocks.push('Returns');
        doc.returns.forEach((ret) => {
            const subBlock = [];
            subBlock.push(chalk.blue(`(${ret.type.names.join(', ')})`));
            if (ret.description) {
                subBlock.push(': ' + ret.description);
            }
            blocks.push(subBlock.join('\t'));
        });
    }
    blocks.push('');
    return blocks.join('\n');
}

exports.createDisplay = createDisplay;
exports.makeHeader = makeHeader;
