import axios from 'axios'
import BotRegistry from '../../blockchain/BotRegistry';
import DeveloperRegistry from '../../blockchain/DeveloperRegistry';
import BotCoin from '../../blockchain/BotCoin';
import { start as startTxObserver } from './txObserverActions';
import { UrlShortener } from '../../google/UrlShortener';
import TxStatus from '../../helpers/TxStatus'


export const BotActions = {
  RESET_STATE: "BOT_RESET_STATE",
  SET_ATTRIBUTE: "BOT_SET_ATTRIBUTE"
}

export const fetchEntryPrice = () => async (dispatch) => {
  let registry = new BotRegistry(BOT_REGISTRY_CONTRACT);
  let price = await registry.getEntryPrice();
  let botCoin = new BotCoin();
  dispatch({ type: BotActions.SET_ATTRIBUTE, key: 'entryPrice', value: botCoin.convertToHuman(price) });
}

const setErrors = (errors)  => {
  return { type: BotActions.SET_ATTRIBUTE, key: 'errors', value: errors }
}

export const allowTransfer = () => {}
export const checkTransferAllowance = () => {}

export const addBot = (ethAddress, url, metadata) => async (dispatch,getState) => {
  let shorten_url = url
  if (url.length > 32) {
    shorten_url = await UrlShortener.shorten(url, URLSHORTENER_API_KEY);
  }
  //NOTE: metadata here is a json string, not an object
  let developerId = getState().developer.developerId;
  console.log("addBot with developerId:", developerId,"url:", shorten_url, " metadata:", metadata);
  console.log("Bot registry contract:", BOT_REGISTRY_CONTRACT);
  let registry = new BotRegistry(BOT_REGISTRY_CONTRACT);
  try {
    let txId = await registry.addBot(developerId, ethAddress, shorten_url, metadata);
    dispatch( { type: BotActions.SET_ATTRIBUTE, key: 'addBotTxId', value: txId });
    dispatch(startTxObserver(txId, addTxMined));
  }catch(e) {
    console.log(e);
    dispatch( setErrors( ["Not signed in MetaMask. Request cancelled."] ));
  }
}

export const resetTxs = () => (dispatch) => {
  dispatch({ type: BotActions.RESET_STATE });
}

const addTxMined = (status) => (dispatch) => {
  dispatch({ type: BotActions.SET_ATTRIBUTE, key: 'addBotTxMined', value: true });
  if(status == TxStatus.SUCCEED){
    dispatch({ type: BotActions.SET_ATTRIBUTE, key: 'successfullyAdded', value: true });
  } else {
    dispatch( setErrors( ["Add bot transaction failed."] ));
  }
}

const payTxMined = (status) => (dispatch) => {
  if(status == TxStatus.SUCCEED){
    console.log("Mined approval transaction");
    dispatch({ type: BotActions.SET_ATTRIBUTE, key: 'allowanceTxMined', value: true });
  }
}

const setPayTxId = (tx_id) => {
  return { type: BotActions.SET_ATTRIBUTE, key: 'allowanceTxId', value: tx_id }
}

export const approvePayment = () => (dispatch, getState) => {
  let botCoin = new BotCoin();
  let chargingContract = BOT_REGISTRY_CONTRACT;
  let amount = getState().bot.entryPrice;
  console.log("Approving for amount ", amount);
  botCoin.approve(amount, chargingContract)
  .then( (tx_id) => {
    dispatch(startTxObserver(tx_id, payTxMined))
    return dispatch( setPayTxId(tx_id) );
  }).catch( (err)=> {
    console.log(err);
    dispatch( setErrors( ["Not approved in MetaMask. Request cancelled."] ));
  });
}
