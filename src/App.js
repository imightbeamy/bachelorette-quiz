import React, { Component } from 'react';
import {StyleSheet, css} from 'aphrodite';
import questions from './questions.json';
import bios from './bios.json';

window.questions = questions;
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
      question: this.findNextQ(this.state.question, scores),
      scores: scores,
    });
  }

  findNextQ(index, scores) {
    if (questions[index + 1].answers.length > 3) {
      return index + 1;
    }
    const currentScores = this.getScores(scores);
    const topScorers = currentScores
      .filter(c => c.score >= Math.min(currentScores[0].score))
      .map(c => c.contestant);

    if (topScorers.length === 1) {
      return null;
    }

    const questions_with_top_scores = questions
    .filter(question =>
        question.answers.length <= 3 &&
        question.question !== questions[index].question)
    .map(question => ({
      question, contestants: question.answers
        .map(a => a.contestant)
        .filter(c => topScorers.indexOf(c) !== -1)
        .length
    }))
    .filter(question => question.contestants)
    .sort((a,b) => b.contestants - a.contestants);
    const next_question = questions_with_top_scores[0] && questions_with_top_scores[0].question;
    return questions.findIndex(q => q.question === next_question.question);
  }

  getScores(scores) {
    return Object.keys(scores)
      .map(k => ({
        contestant: k,
        score: this.state.scores[k],
      }))
      .sort((a,b) => b.score - a.score)
  }

  getWinner() {
    return this.getScores(this.state.scores)[0].contestant;
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
            </ol>,
            this.state.question !== 0 && <button onClick={() => this.resetState()}>Start Over</button>] :
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
