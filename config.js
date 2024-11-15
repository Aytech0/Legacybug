require("./database/module")
global.imageurl = 'https://d.top4top.io/p_3203i01hv5.jpg'
global.owner = "6285381775839"
global.namabot = "yourmine"
global.nomorbot = "6285381775839"
global.namaCreator = "yourmine"
global.versisc = '10'
global.packname = "yourmine"
global.author = "delta x yoshii"
global.jumlah = "5"
global.codeInvite = ""
global.danapay = "https://a.top4top.io/p_3209b53650.jpg" //ubah qris payment
global.isLink = 'https://whatsapp.com/channel/0029VamvnlSBFLgRdp1CYv0R'
global.autoJoin = false
let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update ${__filename}`))
	delete require.cache[file]
	require(file)
})