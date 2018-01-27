if !module.parent
  global.CONFIG = (require('dotenv').config({
    path: __dirname + '/../../config'
  })).parsed

_ = require('wegweg')({
  globals: on
})

Block = require './block'
hash = require './hash'

GENESIS = new Block({
  index: 0
  ctime: 1517012327

  hash: hash.auto(env.GENESIS_HASH_STRING)
  prev: null

  data: env.GENESIS_HASH_STRING
})

blockchain = {
  blocks: [GENESIS]
}

## @todo: redis persistence
blockchain.get_blockchain = ((cb) ->
  return cb null, @blocks
)

blockchain.set_blockchain = ((chain,cb) ->
  @blocks = chain
  require('./peers').broadcast_last_block()

  return cb null, true
)

blockchain.get_block = ((index_or_hash,cb) ->
  if !(block = _.find(@blocks,{index:(+index_or_hash)}))
    block = _.find(@blocks,{hash:index_or_hash})

  return cb null, block
)

blockchain.get_last_block = ((cb) ->
  return cb null, _.last(@blocks)
)

blockchain.add_block = ((block,cb) ->
  await @is_valid_next_block block, null, defer e,valid
  if e then return cb e

  if !valid
    return cb new Error 'Block is invalid'

  @blocks.push new Block(block)
  require('./peers').broadcast_last_block()

  return cb null, true
)

blockchain.replace_chain = ((new_chain,cb) ->
  await @get_last_block defer e,last_block
  if e then return cb e

  if last_block.index >= new_chain.length
    return cb null, false

  await @is_valid_chain new_chain, defer e,valid
  if e then return cb e

  if !valid
    return cb new Error 'Received an invalid chain, refusing to `replace_chain`'

  log 'Replacing our blockchain with a larger chain'

  await @set_blockchain new_chain, defer e
  if e then return cb e

  return cb null, true
)

##
blockchain.is_valid_next_block = ((block,prev_block,cb) ->
  if !Block.is_valid_schema(block)
    log new Error 'Invalid block (schema)'
    return cb null, false

  if !prev_block
    await @get_last_block defer e,prev_block
    if e then return cb e

  # validate index
  if block.index isnt (prev_block.index + 1)
    log new Error 'Invalid block (`index`)'
    return cb null, false

  # validate prev
  if block.prev isnt prev_block.hash
    log new Error 'Invalid block (`prev`)'
    return cb null, false

  # validate hash
  if block.hash isnt (calced_hash = Block.calculate_hash(block))
    log new Error 'Invalid block (`hash`)'
    return cb null, false

  # k
  return cb null, true
)

# validate a chain (starting at the genesis block)
blockchain.is_valid_chain = ((chain,cb) ->

  # validate genesis block
  chain_genesis = chain[0]

  for key in ['index','hash','ctime']
    if chain_genesis[key] isnt GENESIS[key]
      log new Error 'Invalid genesis block'
      return cb null, false

  # iterate the chain
  i = 0; for block in chain
    if i is 0
      i += 1
      continue

    await @is_valid_next_block block, chain[i - 1], defer e,valid
    if e then return cb e

    if !valid
      log new Error 'Invalid block in chain', block.index
      return cb null, false
    else
      i += 1

  return cb null, true
)

blockchain.generate_next_block = ((data,cb) ->
  await @get_last_block defer e,last
  if e then return cb e

  block = new Block({
    index: (last.index + 1)
    ctime: _.time()
    prev: last.hash
    data: data
  })

  block.hash = Block.calculate_hash(block)

  return cb null, block
)

##
blockchain.get_difficulty = ((cb) ->
  await @get_last_block defer e,last
  if e then return cb e

  difficulty = (last.difficulty ? env.DIFFICULTY_START)

  # adjust difficulty based on last block's solve-time
  if last.index % env.DIFFICULTY_START and last.index isnt 0
    log 'Calculating new difficulty'

    last_adjustment_index = (last.index + 1 - env.DIFFICULTY_INCREASE_INTERVAL_BLOCKS)

    await @get_block last_adjustment_index, defer e,last_adjustment_block
    if e then return cb e

    if !last_adjustment_block
      return cb null, difficulty

    difficulty = last_adjustment_block.diff

    secs_expected = (env.DIFFICULTY_INCREASE_INTERVAL_BLOCKS * env.DIFFICULTY_SOLVE_INTERVAL_SECS)
    secs_elapsed = (last.ctime - last_adjustment_block.ctime)

    log /adjustment parameters/, {expected:seconds_expected,elapsed:seconds_elapsed}

    if secs_elapsed < (secs_expected / 2)
      log 'Increasing difficulty by 1', (difficulty + 1)
      difficulty += 1

    else if secs_elapsed > (secs_expected * 2)
      log 'Reducing difficulty by 1', (difficulty - 1)
      difficulty -= 1
    else
      log 'Keeping the same difficulty level for now', difficulty

  return cb null, difficulty
)

##
module.exports = blockchain

## test
if !module.parent
  log /TEST/

  await blockchain.generate_next_block 'Hello', defer e,next_block
  if e then throw e

  log /next_block/, next_block

  exit 0

