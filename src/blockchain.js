import sha256 from 'sha256';

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount
    }
}

class Block {
    constructor(timestamp, transactions, previousHash = ``) {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return sha256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.calculateHash.nonce)
    }

    mineBlock(difficulty) {
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join(`0`)) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log(`Block Mined: ${this.hash}`);
    }
}

class Blockchain {
    constructor(genesisNode) {
        this.chain = [this.createGenesisBlock()];
        this.nodes = [+genesisNode];
        this.difficulty = 4;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    registerNode(port) {
        if(!this.nodes.includes(port)) {
            this.nodes.push(port);
        }
    }

    retrieveNodes() {
        return this.nodes;
    }

    updateBlockchain(newChain) {
        this.chain = newChain;
    }

    createGenesisBlock() {
        return new Block(Date.now(), [], `0`);
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress) {
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log(`Block mined successfully!`);

        this.chain.push(block);

        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    createTransaction(transaction) {
        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address) {
        let balance = 0;

        for(const block of this.chain) {
            for(const trans of block.transactions) {
                if(trans.fromAddress === address) balance -= trans.amount

                if(trans.toAddress === address) balance += trans.amount
            }
        }

        return balance;
    }

    isChainValid() {
        for(let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if(currentBlock.hash !== currentBlock.calculateHash()) return false;

            if(currentBlock.previousHash !== previousBlock.hash) return false;
        }

        return true;
    }
}

export {
    Block, Transaction, Blockchain
}