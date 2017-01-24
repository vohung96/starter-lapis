// @flow weak
import React, { Component } from 'react';
import applyStyles from 'react-css-modules';
import styles from './Autosuggest.css';
import Autosuggest from 'react-autosuggest';
import { api } from 'services';
import debounce from 'debounce';
import Textarea from 'react-textarea-autosize';

const getTokenForSuggestions = (str, caretPosition) => {
  let word;

  const left = str.slice(0, caretPosition).search(/\S+$/);
  const right = str.slice(caretPosition).search(/\s/);

  if (right < 0) {
    word = str.slice(left);
  } else {
    word = str.slice(left, right + caretPosition);
  }

  if (!word || word.trim().length < 2) {
    return null;
  }

  word = word.trim().toLowerCase();

  if (word.length > 0) {
    return word;
  } else {
    return null;
  }
};

// Teach Autosuggest how to calculate suggestions for any given input value.
function getSuggestions(value: string, suggestions: Array<Object>, hideSameLastValue: boolean = false) {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  if (inputLength === 0) {
    return [];
  }

  if (suggestions.length === 1
    && hideSameLastValue
    && suggestions[0].value.toLowerCase() === inputValue) {
    return [];
  }

  return suggestions.slice(0, 3);
}

const renderInputComponent = inputProps => (
  <Textarea rows={1} {...inputProps} />
);

function getSuggestionValue(suggestion) {
  return suggestion.value;
}

function renderSuggestion(suggestion) {
  return (
    <div>
      {suggestion.value}
    </div>
  );
}

async function callApi(type: string, value: string) {
  return await api.dadata[type](value);
}

@applyStyles(styles)
export default class AsyncTextareaAutosuggest extends Component {
  state: {
    suggestions: Array<Object>;
    isLoading: boolean;
  }
  input: HTMLInputElement;
  autosuggest: Object;
  focus: () => void;
  debouncedLoadSuggestions: () => () => void;

  constructor() {
    super();
    this.state = {
      suggestions: [],
      isLoading: false,
    };

    this.debouncedLoadSuggestions = debounce(this.loadSuggestions, 500);
    this.focus = () => this.input.focus();
  }


  componentWillUnmount() {
    if (this.debouncedLoadSuggestions) {
      this.debouncedLoadSuggestions.clear();
    }
  }

  async loadSuggestions(value) {
    const isInputBlank = value.trim() === '';
    const { hideSameLastValue } = this.props;
    if (isInputBlank) return;
    this.setState({
      isLoading: true
    });
    try {
      const response = await callApi(this.props.type, value);
      const suggestions = getSuggestions(value, response.suggestions, hideSameLastValue);
      if (value === this.props.input.value) {
        this.setState({
          suggestions,
        });
      }
    } catch (err) {
      console.log(err);
    }
    this.setState({
      isLoading: false,
    });
  }

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested = ({ value }) => {
    const textarea = this.autosuggest.input;

    if (textarea) {
      // const token = getTokenForSuggestions(value, textarea.selectionStart);
      const token = value;
      console.log(value, textarea.selectionStart, token);

      if (token !== null) {
        this.debouncedLoadSuggestions(value);
      } else {
        this.setState({ suggestions: [] });
      }
    }
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  onSuggestionSelected = (event, { suggestion, suggestionValue, sectionIndex, method }) => {
    event.preventDefault();

    const textarea = this.autosuggest.input;

    this.props.input.onChange(suggestionValue); // Redux-form change handler
    if (this.props.onChange) this.props.onChange(suggestionValue);
  };

  renderSuggestionsContainer = ({ children, ...rest }) => {
    const { isSlim } = this.props;
    return (
      <div className={(isSlim) ? styles['extra-container-without-padding'] : styles['extra-container']}>
        <div {...rest}>
          {children}
        </div>
      </div>
    );
  }

  render() {
    const { suggestions } = this.state;

    // Autosuggest will pass through all these props to the input field.
    const inputProps = {
      ...this.props.input,
      value: (typeof this.props.input.value === 'string' || this.props.input.value instanceof String) ? this.props.input.value : '',
    };


    // Finally, render it!
    return (
      <Autosuggest
        ref={(c) => {
          if (c) {
            this.input = c.input;
            this.autosuggest = c;
          }
        }
        }
        theme={styles}
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        onSuggestionSelected={this.onSuggestionSelected}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        renderSuggestionsContainer={this.renderSuggestionsContainer}
        renderInputComponent={renderInputComponent}
        inputProps={inputProps}
      />
    );
  }
}
