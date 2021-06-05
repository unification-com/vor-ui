const { serializeError } = require("serialize-error")
const { VORCoordinator } = require("./VORCoordinator")
const {
  NewServiceAgreement,
  ChangeFee,
  ChangeGranularFee,
  RandomnessRequest,
  RandomnessRequestFulfilled,
} = require("./db/models")

const { WATCH_FROM_BLOCK } = process.env

class ProviderOracle {
  async initOracle() {
    this.VORCoordinator = new VORCoordinator()
    await this.VORCoordinator.initWeb3()
    this.currentBlock = await this.VORCoordinator.getBlockNumber()

    this.newServiceAgreementEvent = "NewServiceAgreement"
    this.changeFeeEvent = "ChangeFee"
    this.changeGranularFeeEvent = "ChangeGranularFee"
    this.randomnessRequestEvent = "RandomnessRequest"
    this.randomnessRequestFulfilledEvent = "RandomnessRequestFulfilled"

    this.fromBlockRequests = WATCH_FROM_BLOCK || this.currentBlock
    this.fromBlockFulfillments = WATCH_FROM_BLOCK || this.currentBlock

    console.log(new Date(), "current Eth height", this.currentBlock)
  }

  async runOracle() {
    console.log(new Date(), "watching", this.newServiceAgreementEvent, "from block", this.fromBlockRequests)
    this.watchNewServiceAgreement()
    console.log(new Date(), "watching", this.changeFeeEvent, "from block", this.fromBlockRequests)
    this.watchChangeFee()
    console.log(new Date(), "watching", this.changeGranularFeeEvent, "from block", this.fromBlockRequests)
    this.watchChangeGranularFee()
    console.log(new Date(), "watching", this.randomnessRequestEvent, "from block", this.fromBlockRequests)
    this.watchRandomnessRequest()
    console.log(
      new Date(),
      "watching",
      this.randomnessRequestFulfilledEvent,
      "from block",
      this.fromBlockRequests,
    )
    this.watchRandomnessRequestFulfilled()
  }

  /**
   * Watch for NewServiceAgreement events
   *
   * @returns {Promise<void>}
   */
  async watchNewServiceAgreement() {
    console.log(new Date(), "BEGIN watchNewServiceAgreement")
    const self = this
    await this.VORCoordinator.watchEvent(
      this.newServiceAgreementEvent,
      this.fromBlockRequests,
      async function processEvent(event, err) {
        if (err) {
          console.error(
            new Date(),
            "ERROR watchNewServiceAgreement.processEvent for event",
            self.dataRequestEvent,
          )
          console.error(JSON.stringify(serializeError(err), null, 2))
        } else {
          const { transactionHash, transactionIndex, blockNumber, blockHash } = event
          const { keyHash, fee } = event.returnValues

          const providerAddress = await self.VORCoordinator.getProviderAddress(keyHash)
          const [fr, frCreated] = await NewServiceAgreement.findOrCreate({
            where: {
              txHash: transactionHash,
            },
            defaults: {
              keyHash,
              fee,
              publicKey: "",
              providerAddress,
              blockNumber,
              blockHash,
              txHash: transactionHash,
              txIndex: transactionIndex,
            },
          })

          if (frCreated) {
            console.log(new Date(), `NewServiceAgreement event created, keyHash ${keyHash} fee ${fee}`)
          } else {
            console.log(
              new Date(),
              `NewServiceAgreement event already existing on db - txHash: ${transactionHash}`,
            )
          }
        }
      },
    )
  }

  /**
   * Watch for ChangeFee events
   *
   * @returns {Promise<void>}
   */
  async watchChangeFee() {
    console.log(new Date(), "BEGIN watchChangeFee")
    const self = this
    await this.VORCoordinator.watchEvent(
      this.changeFeeEvent,
      this.fromBlockRequests,
      async function processEvent(event, err) {
        if (err) {
          console.error(new Date(), "ERROR watchChangeFee.processEvent for event", self.dataRequestEvent)
          console.error(JSON.stringify(serializeError(err), null, 2))
        } else {
          const { transactionHash, transactionIndex, blockNumber, blockHash } = event
          const { keyHash, fee } = event.returnValues

          const [fr, frCreated] = await ChangeFee.findOrCreate({
            where: {
              txHash: transactionHash,
            },
            defaults: {
              keyHash,
              fee,
              blockNumber,
              blockHash,
              txHash: transactionHash,
              txIndex: transactionIndex,
            },
          })

          if (frCreated) {
            console.log(new Date(), `ChangeFee event created, keyHash ${keyHash} fee ${fee}`)
          } else {
            console.log(new Date(), `ChangeFee event already existing on db - txHash: ${transactionHash}`)
          }
        }
      },
    )
  }

  /**
   * Watch for ChangeGranularFee events
   *
   * @returns {Promise<void>}
   */
  async watchChangeGranularFee() {
    console.log(new Date(), "BEGIN watchChangeGranularFee")
    const self = this
    await this.VORCoordinator.watchEvent(
      this.changeGranularFeeEvent,
      this.fromBlockRequests,
      async function processEvent(event, err) {
        if (err) {
          console.error(
            new Date(),
            "ERROR watchChangeGranularFee.processEvent for event",
            self.dataRequestEvent,
          )
          console.error(JSON.stringify(serializeError(err), null, 2))
        } else {
          const { transactionHash, transactionIndex, blockNumber, blockHash } = event
          const { keyHash, consumer, fee } = event.returnValues

          const [fr, frCreated] = await ChangeGranularFee.findOrCreate({
            where: {
              txHash: transactionHash,
            },
            defaults: {
              keyHash,
              consumer,
              fee,
              blockNumber,
              blockHash,
              txHash: transactionHash,
              txIndex: transactionIndex,
            },
          })

          if (frCreated) {
            console.log(new Date(), `ChangeGranularFee event created, keyHash ${keyHash} fee ${fee}`)
          } else {
            console.log(
              new Date(),
              `ChangeGranularFee event already existing on db - txHash: ${transactionHash}`,
            )
          }
        }
      },
    )
  }

  /**
   * Watch for RandomnessRequest events
   *
   * @returns {Promise<void>}
   */
  async watchRandomnessRequest() {
    console.log(new Date(), "BEGIN watchRandomnessRequest")
    const self = this
    await this.VORCoordinator.watchEvent(
      this.randomnessRequestEvent,
      this.fromBlockRequests,
      async function processEvent(event, err) {
        if (err) {
          console.error(
            new Date(),
            "ERROR watchRandomnessRequest.processEvent for event",
            self.dataRequestEvent,
          )
          console.error(JSON.stringify(serializeError(err), null, 2))
        } else {
          const { transactionHash, transactionIndex, blockNumber, blockHash } = event
          const { keyHash, seed, sender, fee, requestID } = event.returnValues
          const [fr, frCreated] = await RandomnessRequest.findOrCreate({
            where: {
              txHash: transactionHash,
            },
            defaults: {
              keyHash,
              seed,
              sender,
              fee,
              requestID,
              blockNumber,
              blockHash,
              txHash: transactionHash,
              txIndex: transactionIndex,
            },
          })

          if (frCreated) {
            console.log(
              new Date(),
              `RandomnessRequest event created, keyHash ${keyHash} requestID ${requestID}`,
            )
          } else {
            console.log(
              new Date(),
              `RandomnessRequest event already existing on db - txHash: ${transactionHash}`,
            )
          }
        }
      },
    )
  }

  /**
   * Watch for RandomnessRequestFulfilled events
   *
   * @returns {Promise<void>}
   */
  async watchRandomnessRequestFulfilled() {
    console.log(new Date(), "BEGIN watchRandomnessRequestFulfilled")
    const self = this
    await this.VORCoordinator.watchEvent(
      this.randomnessRequestFulfilledEvent,
      this.fromBlockRequests,
      async function processEvent(event, err) {
        if (err) {
          console.error(
            new Date(),
            "ERROR watchRandomnessRequestFulfilled.processEvent for event",
            self.dataRequestEvent,
          )
          console.error(JSON.stringify(serializeError(err), null, 2))
        } else {
          const { transactionHash, transactionIndex, blockNumber, blockHash } = event
          const { requestId, output } = event.returnValues
          const txRceipt = await self.VORCoordinator.getTransactionReceipt(transactionHash)
          const tx = await self.VORCoordinator.getTransaction(transactionHash)
          console.log(new Date(), "Gas Information", txRceipt.gasUsed, tx.gasPrice)
          const [fr, frCreated] = await RandomnessRequestFulfilled.findOrCreate({
            where: {
              txHash: transactionHash,
            },
            defaults: {
              requestID: requestId,
              output,
              blockNumber,
              blockHash,
              txHash: transactionHash,
              txIndex: transactionIndex,
              gasUsed: txRceipt.gasUsed,
              gasPrice: tx.gasPrice
            },
          })
          if (frCreated) {
            console.log(
              new Date(),
              `RandomnessRequestFulfilled event created, output ${output} requestID ${requestId}`,
            )
          } else {
            console.log(
              new Date(),
              `RandomnessRequestFulfilled event already existing on db - txHash: ${transactionHash}`,
            )
          }
        }
      },
    )
  }
}

module.exports = {
  ProviderOracle,
}
