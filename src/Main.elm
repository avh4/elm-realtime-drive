module Main where

import Graphics.Element (..)
import Graphics.Input (..)
import Text
import Signal
import Google.Drive.Realtime as Realtime

realtime = Realtime.client "62036537683-2uohqnr6titmrhm6q96q8kc182ahphf0.apps.googleusercontent.com"

scene state = flow down
  [ case state of
      Realtime.ReadyToAuthenticate ->
        button (Signal.send realtime.authorize ()) "Authorize"
      _ -> Text.asText state
  ]

main = Signal.map scene realtime.state
