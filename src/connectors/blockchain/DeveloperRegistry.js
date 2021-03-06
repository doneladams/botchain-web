import artifact from './abi/DeveloperRegistryDelegate.json'
import BaseRegistry from './BaseRegistry'

class DeveloperRegistry extends BaseRegistry {
  constructor() {
    super();
    this.contract = new this.web3.eth.Contract(artifact.abi, DEVELOPER_REGISTRY_CONTRACT);
  }

  getDeveloperId() {
    let contract = this.contract;
    return this.web3.eth.getAccounts().then( (accounts) => {
      let ethAddress = accounts[0];
      return contract.methods.owns(ethAddress).call({from: accounts[0]});
    });
  }

  getDeveloperApproval(developerId) {
    let contract = this.contract;
    return this.web3.eth.getAccounts().then( (accounts) => {
      return contract.methods.approvalStatus(developerId).call({from: accounts[0]});
    });
  }

  /**
  * @param {string} url
  * @param {string} metadata
  * @returns {Promise}
  */
  addDeveloper(url, metadata) {
    let metadataHash = this.web3.utils.sha3(metadata); // bytes32
    let urlBytes = this.web3.utils.utf8ToHex(url.substring(0,31)); // bytes32
    let contract = this.contract;
    console.log("url: ", urlBytes );
    console.log("data:", metadataHash );
    return this.web3.eth.getAccounts().then( (accounts) => {
      return new Promise(function(resolve,reject) {
        contract.methods.addDeveloper(metadataHash, urlBytes)
        .send({from: accounts[0]},
          function(err,tx_id) {
            if( err ) {
              console.log("addDeveloper error:",err);
              reject( err );
            }else {
              console.log("addDeveloper tx_id:",tx_id);
              resolve(tx_id);
            }
          });

        });
      });
    }
  }

  export default DeveloperRegistry;
