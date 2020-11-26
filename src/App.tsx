import * as React from 'react'
import styled from 'styled-components'
import { autorun, makeAutoObservable, runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'

enum Status {
  Dead,
  Alive
}

class SquareModel {
  x: number
  y: number
  status: Status
  neighbors: SquareModel[]

  constructor(x: number, y: number, status: Status) {
    this.x = x
    this.y = y
    this.status = status
    this.neighbors = []
    makeAutoObservable(this)
  }

  get livingNeighbors(): number {
    return this.neighbors.reduce(
      (total, neighbor) => total + (neighbor.status === Status.Alive ? 1 : 0),
      0
    )
  }

  get nextStatus(): Status {
    //game rules
    if (this.status === Status.Alive) {
      if (this.livingNeighbors < 2) return Status.Dead
      if (this.livingNeighbors > 3) return Status.Dead
      return Status.Alive
    } else {
      if (this.livingNeighbors === 3) return Status.Alive
      return Status.Dead
    }
  }

  flip() {
    this.status = this.status === Status.Dead ? Status.Alive : Status.Dead
  }
}

const length = 40
const board: SquareModel[][] = new Array(length)
  .fill(null)
  .map((_, x) =>
    new Array(length)
      .fill(null)
      .map((_, y) => new SquareModel(x, y, Status.Dead))
  )

for (let x = 1; x < length - 1; x++) {
  for (let y = 1; y < length - 1; y++) {
    const neighbors: SquareModel[] = [
      board[x - 1][y],
      board[x - 1][y - 1],
      board[x - 1][y + 1],
      board[x][y - 1],
      board[x][y + 1],
      board[x + 1][y - 1],
      board[x + 1][y + 1],
      board[x + 1][y]
    ]
    runInAction(() => (board[x][y].neighbors = neighbors))
  }
}

const LineDiv = styled.div`
  margin: 0;
  padding: 0;
  height: 22px;
`

const Button = styled.button`
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bold;
  background-color: lightgreen;
  padding: 5px 15px;
  margin-top: 10px;
`

const ButtonBar = styled.div`
  display: flex;
  justify-content: space-around;
`

const SquareDiv = styled.div<{ status: Status }>`
  width: 20px;
  height: 20px;
  background-color: ${props =>
    props.status === Status.Alive ? '#444' : '#aaa'};
  border-width: 1px;
  border-color: yellow;
  margin: 0 1px;
  display: inline-block;
`

const Square = observer(({ x, y }: { x: number; y: number }) => {
  return (
    <SquareDiv status={board[x][y].status} onClick={() => board[x][y].flip()} />
  )
})

export default function App() {
  const [run, setRun] = React.useState<number | null>(null)

  return (
    <div style={{ width: 'fit-content' }}>
      {board
        .filter((_, x) => x > 0 && x < board.length - 1)
        .map((line, x) => (
          <LineDiv key={x}>
            {line
              .filter((_, y) => y > 0 && y < line.length - 1)
              .map((square, y) => (
                <Square key={y} x={square.x} y={square.y} />
              ))}
          </LineDiv>
        ))}
      <ButtonBar>
        <Button
          onClick={() => {
            if (run) {
              clearInterval(run)
              setRun(null)
            } else
              setRun(
                setInterval(() => {
                  const changingSquares = board
                    .flat()
                    // create a frame at the border line without neighbors
                    .filter(
                      square =>
                        square.x > 0 &&
                        square.x < board.length - 1 &&
                        square.y > 0 &&
                        square.y < board.length - 1
                    )
                    .filter(square => square.status !== square.nextStatus)
                    .map(s => ({ ...s, nextStatus: s.nextStatus }))
                  runInAction(() =>
                    changingSquares.forEach(
                      change =>
                        (board[change.x][change.y].status = change.nextStatus)
                    )
                  )
                }, 1)
              )
          }}
        >
          {run ? 'Stop' : 'Start'}
        </Button>
        <Button
          onClick={() =>
            board
              .flat()
              .filter(
                square =>
                  square.x > 0 &&
                  square.x < board.length - 1 &&
                  square.y > 0 &&
                  square.y < board.length - 1
              )
              .forEach(square => {
                if (Math.random() > 0.5) square.flip()
              })
          }
        >
          Random
        </Button>
      </ButtonBar>
    </div>
  )
}

board
  .flat()
  .forEach(square =>
    autorun(() => console.log(square.x, square.y, square.status))
  )
