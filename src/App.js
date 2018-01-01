import React, { Component } from 'react';
import {StyleSheet, css} from 'aphrodite';
import questions from './questions.json';
import bios from './bios.json';

window.questions = questions;
const style = StyleSheet.create({
  app: {
    padding: 10,
    maxWidth: 600,
    margin: 'auto',
    background: 'white',
    overflow: 'hidden',
  },
  link: {
    color: 'red',
    ':hover': {
      textDecoration: 'none'
    }
  },
  answers: {
    listStyleType: 'none',
  },
  title: {
    color: 'white',
    fontSize: 50,
  },
  header: {
    textAlign: 'center',
    fontFamily: "'Courgette', cursive"
  },
  startOver: {
    float: 'right',
  },
  bio: {
    textAlign: 'center',
  },
  bioImage: {
    borderRadius: '50%',
    maxWidth: '100%',
    padding: 10,
    boxSizing: 'border-box',
  },
  scores: {
    margin: 'auto',
    border: '1px solid black',
    minWidth: '50%',
  },
  scoreCells: {
    padding: 10,
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
      <div>
        <h1 className={css(style.title, style.header)}>Which Bachelor Contestant Are You?</h1>
        <div className={css(style.app)}>
            {current ?
              [<h2 className={css(style.header)}>{current.question}</h2>,
              <ol className={css(style.answers)}>
                {current.answers.map((a, i) =>
                  <li
                    key={i}
                    className={css(style.answer)}
                    onClick={() => this.saveAnswer(a)}
                  >{a.answer}</li>)
                }
              </ol>,
              this.state.question !== 0 && <button
                className={css(style.startOver)}
                onClick={() => this.resetState()}>Start Over</button>] :
              [<h2 className={css(style.header)}>
                You are <a className={css(style.link)} href={bios[this.getWinner()].link}>{this.getWinner()}</a>!
                </h2>,
              <div className={css(style.bio)} >
                <a className={css(style.link)} href={bios[this.getWinner()].link}>
                  <img className={css(style.bioImage)} src={bios[this.getWinner()].headshot} />
                </a>
                <p>{bios[this.getWinner()].occupation}, {bios[this.getWinner()].height}</p>
                <button
                  onClick={() => this.resetState()}
                >Play again!</button>
              </div>,
              <div>
                <h2 className={css(style.header)}>Scores</h2>
                <table className={css(style.scores)}>
                  {this.getScores(this.state.scores).map(score => <tr>
                    <td className={css(style.scoreCells)}>
                      <a className={css(style.link)} href={bios[score.contestant].link}>{score.contestant}</a>
                    </td>
                    <td className={css(style.scoreCells)}>{score.score}</td>
                  </tr>)}
                </table>
              </div>]}
        </div>
        <a className={css(style.link)} href="https://github.com/imightbeamy/bachelorette-quiz">Source</a>
      </div>
    );
  }
}

export default App;
