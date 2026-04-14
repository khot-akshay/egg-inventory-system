import React from 'react' 
import GameList from 'src/components/metaData/games/GameList'

function Games() {
  return (
    <>
      <GameList />
    </>
  )
}
Games.authGuard = true

export default Games