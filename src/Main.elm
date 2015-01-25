module Main where

import Graphics.Element (..)
import Graphics.Input (..)
import Text
import Signal
import Google
import Google.Drive.Realtime as Realtime
import Html
import Html.Attributes as Html

client = Google.client "62036537683-2uohqnr6titmrhm6q96q8kc182ahphf0.apps.googleusercontent.com" (Realtime.model "XYZZY")

scene state model = flow down
  [ case state of
      Google.ReadyToAuthenticate ->
        button (Signal.send client.authorize ()) "Sign in with Google Drive"
      _ -> Text.asText state
  , case model of
      Just s -> Html.textarea [ Html.rows 15, Html.cols 50, Html.disabled True ] [ Html.text s ] |> Html.toElement 200 200
      Nothing -> Text.asText "[no data]"
  ]

main = Signal.map2 scene client.state client.subscribe
