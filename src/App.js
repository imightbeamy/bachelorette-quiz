import React, { Component } from 'react';
import {StyleSheet, css} from 'aphrodite';
import questions from './questions.json';
import bios from './bios.json';

const style = StyleSheet.create({
  app: {
    padding: 10,
  },
  answers: {
    listStyleType: 'none',
  },
  answer: {
    'padding': '1em',
    ':hover': {
      color: 'red',
      cursor: 'pointer',
    },
    ':before': {
      content: "'🌹'",
      marginLeft: '-2em',
      paddingRight: '1em',
    },
  },
});

class App extends Component {

  constructor(props) {
    super(props);
    this.state = Object.assign({
      question: 0,
      scores: {},
    }, localStorage.state ? JSON.parse(localStorage.state) : {});
  }

  componentDidUpdate(prevProps, prevState) {
    localStorage.state = JSON.stringify(this.state);
  }

  resetState() {
    this.setState({
      question: 0,
      scores: {},
    });
  }

  saveAnswer(answer) {
    const scores = this.state.scores;
    scores[answer.contestant] = (scores[answer.contestant] || 0) + 1;
    this.setState({
      question: this.state.question + 1,
      scores: scores,
    });
  }

  getWinner() {
    return Object.keys(this.state.scores)
      .map(k => ({
        contestant: k,
        score: this.state.scores[k],
      }))
      .sort((a,b) => a.score - b.score)[0].contestant;
  }

  render() {
    const current = questions[this.state.question];
    return (
      <div className="App" className={css(style.app)}>
          {current ?
            [<h2>{current.question}</h2>,
            <ol className={css(style.answers)}>
              {current.answers.map((a, i) =>
                <li
                  key={i}
                  className={css(style.answer)}
                  onClick={() => this.saveAnswer(a)}
                >{a.answer}</li>)
              }
            </ol>] :
            [<h2>You are {this.getWinner()}!</h2>,
            <div>
              <img src={bios[this.getWinner()].headshot} />
              <p>Height: {bios[this.getWinner()].height}</p>
              <p>Occupation: {bios[this.getWinner()].occupation}</p>
              <button
                onClick={() => this.resetState()}
              >Play again!</button>
            </div>]}
      </div>
    );
  }
}

export default App;
