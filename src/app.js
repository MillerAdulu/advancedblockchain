import express from 'express';
import bodyParser from 'body-parser';
import rp from 'request-promise';

import cors from './cors';
import {
    Blockchain,
    Transaction
} from './blockchain';

import * as dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 5000;
const blockchain = express();

blockchain.use(bodyParser.json());
blockchain.use(bodyParser.urlencoded({
    extended: true
}));
blockchain.use(cors);

let codeCoin;

async function findLongestBlockchain() {
    let promiseArray = [];
    let newChain = [];

    codeCoin.nodes.map(node => {
        let promise = rp.get({
            uri: `http://localhost:${node}/blockchain/length`,
            json: true
        });

        promiseArray.push(promise);
    });

    let nodes = await Promise.all(promiseArray);

    let longestBlockchainNode = {
        chainLength: 0
    };

    nodes.map(node => {
        if (longestBlockchainNode.chainLength < node.chainLength) longestBlockchainNode = node;
    });

    let longestChain = await rp.get({
        uri: `http://localhost:${+longestBlockchainNode.port}/blockchain`,
        json: true
    });

    codeCoin.updateBlockchain(longestChain.chain)
}

// Add new transaction to the blockchain

const addTransaction = (req, res) => {
    codeCoin.createTransaction(
        new Transaction(
            req.body.fromAddress, req.body.toAddress, req.body.amount
        )
    );

    res.send(`Transaction added to pending transactions.`);
}

// Mine pending transctions & create new transaction for mining reward

const mine = async (req, res) => {
    codeCoin.minePendingTransactions(req.body.rewardAddress);

    let promiseArray = [];

    codeCoin.nodes.map(node => {
        let promise = rp.get({
            uri: `http://localhost:${node}/events/blockchain/update`,
            json: true
        });

        promiseArray.push(promise);
    });

    await Promise.all(promiseArray);

    res.send(`Mining finished. Reward Transaction created`);
}

const printBlockchain = (req, res) => {
    const stringifiedChain = JSON.stringify(codeCoin.chain);
    res.send(stringifiedChain);
}

const registerNode = (req, res) => {
    codeCoin.registerNode(req.body.port);
    res.send(`Node added!`);
}

const lengthBlockchain = (req, res) => {
    res.json({
        chainLength: codeCoin.chain.length,
        port
    });
}

const retrieveBlockchain = (req, res) => {
    res.json({
        chain: codeCoin.chain
    });
}

const retrieveNodes = (req, res) => {
    res.json({
        nodes: codeCoin.retrieveNodes()
    });
}

const resolveBlockchain = (req, res) => {
    findLongestBlockchain();
    res.json({
        message: `Success!`
    })
}

const updateBlockchain = (req, res) => {
    findLongestBlockchain();
    res.json({
        message: `Success!`
    });
}

const getBalance = (req, res) => {
    res.json({
        balance: codeCoin.getBalanceOfAddress(req.params.address)
    })
}

blockchain.get(`/blockchain`, retrieveBlockchain);
blockchain.get(`/blockchain/resolve`, resolveBlockchain);
blockchain.get(`/blockchain/print`, printBlockchain);
blockchain.get(`/blockchain/length`, lengthBlockchain);

blockchain.get(`/balances/:address`, getBalance);
blockchain.get(`/events/blockchain/update`, updateBlockchain);

blockchain.post(`/transactions`, addTransaction);
blockchain.post(`/mine`, mine);
blockchain.route(`/nodes`)
    .post(registerNode)
    .get(retrieveNodes);

blockchain.listen(port, () => {
    codeCoin = new Blockchain(port);

    console.log(`Node listening on port ${port}`);
});