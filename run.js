const fs = require('fs')
const bip39 = require('bip39')
const bip32 = require('bip32')
const bitcoin = require('bitcoinjs-lib')

const wordList = fs.readFileSync('./english.txt').toString().split('\n')
const guessSeedMain = JSON.parse(fs.readFileSync('./guessSeed.json'))
for (const word of guessSeedMain) {
    if (!word === '' && !wordList.includes(word)) {
        throw new Error(word)
    }
}
const config = JSON.parse(fs.readFileSync('./config.json'))
const addresses = config.addresses
const pwd = config.pwd

function bruteForce(startIndex) {
    const guessSeed = [...guessSeedMain]
    for (let w = startIndex; w < wordList.length; w++) {
        const w1 = wordList[w]
        console.log(`${w}-${w1}`)
        guessSeed[2] = w1
        for (const w2 of wordList) {
            guessSeed[9] = w2
            for (const w3 of wordList) {
                guessSeed[10] = w3
                const phrase = guessSeed.join(' ')
                if (bip39.validateMnemonic(phrase)) {
                    const seed = bip39.mnemonicToSeedSync(phrase, pwd)
                    const hdnode = bip32.fromSeed(seed)
                    for (let i = 0; i <= 3; i++) {
                        const path = `m/44'/0'/0'/0/${i}`
                        const node = hdnode.derivePath(path)
                        const address = bitcoin.payments.p2pkh({pubkey: node.publicKey}).address
                        if (addresses.includes(address)) {
                            console.log('Success!')
                            console.log(path)
                            console.dir(phrase)
                            console.log(address)
                            fs.writeFileSync('success.json', JSON.stringify({
                                path, phrase, address
                            }))
                            return
                        }
                    }
                }
            }
        }
    }
}

bruteForce(parseInt(process.argv[2]))