module Main 
  ( module Data.Either
  , module PureScript.CST.Errors
  , getModuleName ) where

import Prelude

import Data.Either (Either(..), either)
import PureScript.CST (PartialModule(..), RecoveredParserResult(..), parsePartialModule)
import PureScript.CST.Errors (printParseError)
import PureScript.CST.Parser.Monad (PositionedError)
import PureScript.CST.Types (ModuleHeader(..), ModuleName(..), Name(..))

getModuleName :: String -> Either PositionedError String
getModuleName text = case  parsePartialModule text of 
  ParseSucceeded cst -> Right $ go cst
  ParseSucceededWithErrors cst errors -> Right $ go cst
  ParseFailed error -> Left error
  where
  go :: forall a. PartialModule a -> String
  go (PartialModule { header: ModuleHeader { name: Name { name: ModuleName name } } }) = name
