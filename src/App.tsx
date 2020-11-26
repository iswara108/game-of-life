import * as React from 'react'
import styled from 'styled-components'
import { makeAutoObservable, action } from 'mobx'
import { observer } from 'mobx-react-lite'
enum Status {
  Dead,
  Alive
}

class SquareModel {
  x: number
  y: number
  status: Status

  constructor(x: number, y: number, status: Status) {
    makeAutoObservable(this)
    this.x = x
    this.y = y
    this.status = status
  }

  get livingNeighbors(): number {
    const neighbors: SquareModel[] = []
    if (this.x > 0) {
      neighbors.push(board[this.x - 1][this.y])
      if (this.y > 0) neighbors.push(board[this.x - 1][this.y - 1])
      if (this.y < board[this.x].length - 1)
        neighbors.push(board[this.x - 1][this.y + 1])
    }
    if (this.y > 0) neighbors.push(board[this.x][this.y - 1])
    if (this.y < board[this.x].length - 1)
      neighbors.push(board[this.x][this.y + 1])
    if (this.x < board.length - 1) {
      if (this.y > 0) neighbors.push(board[this.x + 1][this.y - 1])
      if (this.y < board[this.x].length - 1)
        neighbors.push(board[this.x + 1][this.y + 1])
      neighbors.push(board[this.x + 1][this.y])
    }
    return neighbors.reduce(
      (total, neighbor) => total + (neighbor.status === Status.Alive ? 1 : 0),
      0
    )
  }

  get nextStatus(): Status {
    if (board[this.x][this.y].status === Status.Alive) {
      if (board[this.x][this.y].livingNeighbors < 2) return Status.Dead
      if (board[this.x][this.y].livingNeighbors > 3) return Status.Dead
      return Status.Alive
    } else {
      if (board[this.x][this.y].livingNeighbors === 3) return Status.Alive
      return Status.Dead
    }
  }

  setStatus(status: Status) {
    this.status = status
  }
}

const board: SquareModel[][] = new Array(10)
  .fill(null)
  .map((_, x) =>
    new Array(10).fill(null).map((_, y) => new SquareModel(x, y, Status.Dead))
  )

const flipSquare = action(
  (square: SquareModel) =>
    (square.status = square.status === Status.Dead ? Status.Alive : Status.Dead)
)

const LineDiv = styled.div`
  margin: 0;
  padding: 0;
  height: 22px;
`

const Button = styled.button`
  display: block;
  margin: 0 auto;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bold;
  background-color: lightgreen;
  padding: 5px 15px;
  margin-top: 10px;
`

const SquareDiv = styled.div<{ status: Status; nextStatus: Status }>`
  width: 20px;
  height: 20px;
  background-color: ${props =>
    props.status === Status.Alive && props.nextStatus === Status.Alive
      ? '#444'
      : props.status === Status.Alive && props.nextStatus === Status.Dead
      ? '#644'
      : props.status === Status.Dead && props.nextStatus === Status.Alive
      ? '#a94'
      : '#aaa'};
  border-width: 1px;
  border-color: yellow;
  margin: 0 1px;
  display: inline-block;
`

const Square = observer(({ x, y }: { x: number; y: number }) => {
  return (
    <SquareDiv
      status={board[x][y].status}
      // nextStatus={board[x][y].nextStatus}
      nextStatus={board[x][y].status}
      onClick={() => flipSquare(board[x][y])}
      onMouseOver={() =>
        console.log(
          x,
          y,
          'status',
          board[x][y].status,
          'neighbors',
          board[x][y].livingNeighbors,
          'next',
          board[x][y].nextStatus
        )
      }
    />
  )
})

export default function App() {
  return (
    <div style={{ width: 'fit-content' }}>
      {new Array(10).fill(null).map((_, i) => (
        <LineDiv key={i}>
          {new Array(10).fill(null).map((_, j) => (
            <Square key={j} x={i} y={j} />
          ))}
        </LineDiv>
      ))}
      <Button
        onClick={() => {
          setInterval(() => {
            const nextStatusBoard = board.map((line, x) =>
              line.map((square, y) => square.nextStatus)
            )

            board.forEach((line, x) =>
              line.forEach((square, y) =>
                square.setStatus(nextStatusBoard[x][y])
              )
            )
          }, 1000)
        }}
      >
        Start
      </Button>
    </div>
  )
}
