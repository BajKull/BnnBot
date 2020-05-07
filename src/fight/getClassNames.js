const classes = ['warrior', 'mage', 'druid', 'rogue']

const getClassNames = () => classes.reduce((acc, name) =>  acc.concat(', ' + name))

module.exports = { getClassNames }

