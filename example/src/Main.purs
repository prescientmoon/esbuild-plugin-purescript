{- Works with comments -}
module Main.Something where

import Prelude

import Effect (Effect)
import Effect.Console (log)
import Message (message)

main :: Effect Unit
main = do
  log message
