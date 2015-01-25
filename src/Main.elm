module Main where

import Graphics.Element (..)
import Graphics.Input (..)
import Text
import Signal
import Google.Drive.Realtime as Realtime

realtime = Realtime.client "62036537683-2uohqnr6titmrhm6q96q8kc182ahphf0.apps.googleusercontent.com"

scene canAuthorize = flow down
  [ Text.asText realtime
  , if canAuthorize then button (Signal.send realtime.authorize ()) "Authorize" else Text.asText "Waiting for Google..."
  ]

main = Signal.map scene realtime.enableAuthorizeButton
