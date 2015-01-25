module Google.Drive.Realtime where

import Native.Google.Drive.Realtime
import Signal
import Signal (Signal, Channel)


type alias Client =
  { model: String -> Signal String
  , authorize: Channel ()
  , enableAuthorizeButton: Signal Bool
  }

client : String -> Client
client = Native.Google.Drive.Realtime.client
