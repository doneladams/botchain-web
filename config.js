const configs = {
  development: {
    title: '[DEV] Botchain ',
    api_endpoint: 'http://localhost:3001',
    botchain_contract: "0x8b2c764339b269828eb2548ae1a821244bd0e232",
    etherscan_url: "https://kovan.etherscan.io"
  },
  demo: {
    title: '[TESTNET] Botchain ',
    api_endpoint: 'https://botchain-api.botchain.talla.io',
    botchain_contract: "0xd71b558354bc436a2a4e39ae8f6baca4f3581176",
    etherscan_url: "https://kovan.etherscan.io"
  },
  production: { // the same with demo right now
    title: 'Botchain',
    api_endpoint: 'https://botchain-api.botchain.talla.io',
    botchain_contract:  "0xd71b558354bc436a2a4e39ae8f6baca4f3581176",
    etherscan_url: "https://etherscan.io"
  }
}

export default (dev) => {
  let enviroment = ( dev ? 'development' : 'production' );
  if( process.env['ENV'] !== undefined ) {
    enviroment = process.env['ENV'];
  }
  return configs[ enviroment.toLowerCase() ];
}
