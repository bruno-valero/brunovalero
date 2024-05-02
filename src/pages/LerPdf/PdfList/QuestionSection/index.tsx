import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { useEffect, useMemo } from "react";

import { Pdf, QuestionPdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import colors from "@/src/constants/colors";
import { UseState } from "@/utils/common.types";
import AskQuestion from "./AskQuestion";
import ShowQuestionContent from "./ShowQuestionContent";

interface QuestionSectionProps {
    questionHooks:{
        showQuestions:UseState<boolean>,
        questionList:UseState<QuestionPdf[]>,
        showQuestion:UseState<QuestionPdf | null>,
        askQuestion:UseState<boolean>,
        details:UseState<Pdf | null>,
        showQuestionList:UseState<boolean>,
        
    }
}

export default function QuestionSection({ questionHooks  }:QuestionSectionProps) {

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState;
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase;
    const [publicError, setPublicError] = globalState.publicError;


    const [ questionList, setQuestionList ] = questionHooks.questionList;
    const [ showQuestion, setShowQuestion ] = questionHooks.showQuestion;
    const [askQuestion, setAskQuestion] = questionHooks.askQuestion;
    const [details, setDetails] = questionHooks.details;
    const [showQuestionList, setShowQuestionList] = questionHooks.showQuestionList;

    function gotToQuestion(question:QuestionPdf) {
        setShowQuestion(question);
        setShowQuestionList(false);
        setAskQuestion(false);
    }

    const questionListMemo = useMemo(() => questionList.map(item => (
        <button onClick={() => gotToQuestion(item)} className="rounded-md shadow p-4 w-full my-2" >
            <h3 className="text-lg font-semibold" style={{color:colors.valero()}} >
                {item.question}
            </h3>
        </button>
    )), [questionList]) 

    useEffect(() => {
        console.log(`showQuestion ${showQuestion}`)
        console.log(`askQuestion ${askQuestion}`)
        // console.log(`showQuestion ${showQuestion}`)
    }, [showQuestion, askQuestion, questionList])


    return (
        <div className="w-full" >
            {showQuestion && !askQuestion && !showQuestionList ? (
                <ShowQuestionContent question={showQuestion} />
            ) : ((questionList.length === 0 || askQuestion) && !showQuestionList) ? (
                <AskQuestion questionHooks={questionHooks} />
            ) : questionListMemo}
        </div>
    );

};