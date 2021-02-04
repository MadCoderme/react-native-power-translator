import React, { Component } from 'react';
import { Text, View } from 'react-native';
import PropTypes from 'prop-types';
import { TranslatorFactory } from '../services';
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * Main component of Power Translator module.
 * Translate the text and return the view.
 * The source and target language can be specified through the Translation service.
 */
export default class PowerTranslator extends Component {
    translatedText;

    static propTypes = {
      /**
         * text is your text that need to translate
         * into target language
         */
      text: PropTypes.string.isRequired,

      /**
         * onTranslationStart is a function callback which trigger
         * when the translation is start
         */
      onTranslationStart: PropTypes.func,

      /**
         * onTranslationDone is a function callback which trigger
         * when the translation is done
         */
      onTranslationEnd: PropTypes.func,

      /**
         * style of the translated text.
         * all the styles for Text component is valid.
         */
      style: PropTypes.object,

      target: PropTypes.string
    };

    static defaultProps = {
      text: '',
      style: {},
      onTranslationStart: () => {},
      onTranslationEnd: () => {},
    };

    constructor(props) {
      super(props);
      this.state = {
        translatedText: '',
      };
    }

    componentDidMount() {
      this.getTranslation();
    }

    componentWillReceiveProps() {
      this.getTranslation();
    }

    async getTranslation() {
      this.props.onTranslationStart();
      const translator = TranslatorFactory.createTranslator();

      var prevt = await AsyncStorage.getItem('translations')
      var prev = prevt ? JSON.parse(prevt) : []

      if(prev.some(obj => obj.from === this.props.text && obj.target === this.props.target)){
        var idx = prev.findIndex(obj => obj.from === this.props.text && obj.target === this.props.target)

        this.setState({translatedText: prev[idx].to})
      }else{
      translator.translate(this.props.text).then((translated) => {
        this.setState({ translatedText: translated }, () => {
          this.props.onTranslationEnd();
          this.catch(translated)
        });
      });
    }
    }
   catch = async(translation) => {
      var prevt = await AsyncStorage.getItem('translations')
      var prev = prevt ? JSON.parse(prevt) : []
      var toAdd = {from: this.props.text, target: this.props.target, to: translation}

      if(prev.some(obj => JSON.stringify(obj) == JSON.stringify(toAdd))){
      }else{
        await AsyncStorage.setItem('translations', JSON.stringify([...prev, toAdd]))
      }
    }
    render() {
      return (
          <Text style={[{ ...this.props.style }]}>
            {this.state.translatedText}
          </Text>
      );
    }
}
