module Google.Drive.Realtime
  ( State(..)
  , Client
  , client
  ) where

import Native.Google.Drive.Realtime
import Signal
import Signal (Signal, Channel)

type State
  = Initializing
  | ReadyToAuthenticate
  | Authenticated

type alias Client =
  { model: String -> Signal String
  , authorize: Channel ()
  , state : Signal State
  }

client : String -> Client
client = Native.Google.Drive.Realtime.client
