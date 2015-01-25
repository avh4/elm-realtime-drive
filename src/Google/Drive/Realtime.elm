module Google.Drive.Realtime
  ( model
  ) where

import Native.Google.Drive.Realtime
import Google
import Signal (Signal)

model : String -> Google.Module (Maybe String)
model = Native.Google.Drive.Realtime.model
