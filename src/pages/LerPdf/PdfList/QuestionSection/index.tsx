import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { useMemo } from "react";

import { Pdf, QuestionPdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import { UseState } from "@/utils/common.types";
import AskQuestion from "./AskQuestion";

interface QuestionSectionProps {
    questionHooks:{
        showQuestions:UseState<boolean>,
        questionList:UseState<QuestionPdf[]>,
        showQuestion:UseState<QuestionPdf | null>,
        askQuestion:UseState<boolean>,
        details:UseState<Pdf | null>,
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


    const questionListMemo = useMemo(() => questionList.map(item => (
        <div>
            {item.question}
        </div>
    )), [questionList]) 


    return (
        <div className="w-full" >
            {showQuestion ? (
                <div>
                    Question
                </div>
            ) : (questionList.length === 0 || askQuestion) ? (
                <AskQuestion questionHooks={questionHooks} />
            ) : questionListMemo}
        </div>
    );

};