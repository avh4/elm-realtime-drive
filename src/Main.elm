module Main where

import Graphics.Element (..)
import Graphics.Input (..)
import Text
import Signal
import Google.Drive.Realtime as Realtime
import Html
import Html.Attributes as Html

realtime = Realtime.client "62036537683-2uohqnr6titmrhm6q96q8kc182ahphf0.apps.googleusercontent.com"

scene state model = flow down
  [ case state of
      Realtime.ReadyToAuthenticate ->
        button (Signal.send realtime.authorize ()) "Authorize"
      _ -> Text.asText state
  , case model of
      Just s -> Html.textarea [ Html.rows 15, Html.cols 50, Html.disabled True ] [ Html.text s ] |> Html.toElement 200 200
      Nothing -> Text.asText "[no data]"
  ]

main = Signal.map2 scene realtime.state realtime.model
