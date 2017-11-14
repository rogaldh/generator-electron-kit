module.exports = (screen, denySelect = false) => { // eslint-disable-line fp/no-mutation
  const [secondaryDisplay] = screen
    .getAllDisplays()
    .filter(({ bounds: { x, y } }) => (x !== 0 || y !== 0))

  return (secondaryDisplay && !denySelect)
    ? { x: secondaryDisplay.bounds.x, y: secondaryDisplay.bounds.y }
    : { x: 0, y: 0 }
}
