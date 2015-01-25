module Google
  ( State(..), Module
  , Client
  , client
  ) where

import Native.Google
import Signal
import Signal (Signal, Channel)

type Module a = NativeModule a

type State
  = Initializing
  | ReadyToAuthenticate
  | Authenticated

type alias Client a =
  { authorize: Channel ()
  , state: Signal State
  , subscribe: Signal a
  }

client : String -> Module a -> Client a
client = Native.Google.client
