import React, { Component } from 'react';
import {connect} from 'react-redux'
import { Redirect } from 'react-router-dom'
import { Head, withRouter, Link } from 'react-static';
import BotForm from '../components/bot/BotForm';
import Errors from '../components/Errors';
import NotDeveloperError from '../components/developer/NotDeveloperError';
import PendingApprovalError from '../components/developer/PendingApprovalError';
import PaymentModal from '../components/shared/PaymentModal';
import TransactionModal from '../components/shared/TransactionModal';
import MetamaskErrors from '../components/MetamaskErrors';
import TxStatus from '../connectors/helpers/TxStatus'
import * as BotActions from '../connectors/redux/actions/botActions';
import * as MetamaskActions from '../connectors/redux/actions/metamaskActions';
import * as DeveloperActions from '../connectors/redux/actions/developerActions';
import requireMetamask from '../hocs/requireMetamask';
import Success from '../components/bot/Success';

class BotPage extends Component {

  constructor(props) {
    super(props);
    this.state = { payment_modal_visible: false };
  }

  componentDidMount() {
    this.props.connectToMetamask();
    this.props.fetchEntryPrice();
    this.props.fetchDeveloperId();
  }

  componentWillReceiveProps(nextProps) {
    console.log("nextProps", nextProps);
    if( nextProps.bot.errors.length > 0 ) {
      console.log("hiding payment modal");
      this.setState({payment_modal_visible: false});
    }
  }

  submit = (values) => {
    this.props.reset();
    this.setState({payment_modal_visible: true, values: values});
  }

  cancelClick = () => {
    this.setState({payment_modal_visible: false});
  }

  approveClick = () => {
    console.log("Starting approve request");
    this.props.approvePayment();
  }

  continueClick = () => {
    console.log("Sending actual addBot transaction");
    this.props.addBot(this.state.values.eth_address, this.state.values.metadata_url, this.state.values.metadata);

  }

  render() {

    return (
      <div>
        <Head>
          <title>{SITE_TITLE}</title>
        </Head>
        <div>
          <h1>Bot Registration</h1>
          <Success eth_address={this.props.bot.eth_address} visible={this.props.bot.successfullyAdded} />
          <div className={ this.props.bot.successfullyAdded ? 'hidden' : '' } >
            {!this.props.developer.developerApproval && (
              <p className='alert-info'>Note : You have to be pre-approved to successfully complete the registration. Please <a href="https://botchain.talla.com/developers">click here</a> to request approval. Read more about the Bot Registration Process <a href="/faq#bot_registration" target="_blank">here.</a> </p>
            )}
            <MetamaskErrors metamask={this.props.metamask} />
            <Errors errors={this.props.bot.errors} />
            {this.props.developer.developerId == 0 && <NotDeveloperError />}
            {this.props.developer.developerId > 0 && !this.props.developer.developerApproval && <PendingApprovalError />}
            <BotForm onSubmit={this.submit} />
            <PaymentModal token_balance={this.props.metamask.token_balance} tx_id={this.props.bot.allowanceTxId} visible={this.state.payment_modal_visible && (!this.props.bot.allowanceTxMined) } okClick={this.okClick} approveClick={this.approveClick} cancelClick={this.cancelClick} entryPrice={this.props.bot.entryPrice} />
            <TransactionModal tx_id={this.props.bot.addBotTxId} visible={this.state.payment_modal_visible && this.props.bot.allowanceTxMined && (!this.props.bot.addBotTxMined) } okClick={this.okClick} continueClick={this.continueClick} cancelClick={this.cancelClick}  />
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    bot: state.bot,
    developer: state.developer,
    metamask: state.metamask,
    transactions: state.txObserver.transactions
  }
}

const mapDispatchToProps = dispatch => {
  return {
    reset: () => {
      dispatch( BotActions.resetTxs() );
    },
    fetchDeveloperId: () => {
      dispatch( DeveloperActions.fetchDeveloperId() );
    },
    fetchEntryPrice: () => {
      dispatch( BotActions.fetchEntryPrice() );
    },
    connectToMetamask: () => {
      dispatch( MetamaskActions.connectToMetamask());
    },
    approvePayment: () => {
      dispatch( BotActions.approvePayment() );
    },
    addBot: (ethAddress, url, metadata) => {
      dispatch( BotActions.addBot(ethAddress, url, metadata) );
    }
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(requireMetamask(BotPage));
